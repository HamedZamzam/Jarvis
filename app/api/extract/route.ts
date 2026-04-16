import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Jarvis, a smart task extraction assistant. Extract clear, actionable tasks from voice transcripts.

Rules:
- Extract ONLY actionable tasks (things someone needs to DO)
- Each task has a clear, concise title
- If a person is mentioned as responsible, include them as assignee
- If a deadline or date is mentioned, include it as due_date in YYYY-MM-DD format
- If description adds useful context, include it
- Respond ONLY with a valid JSON array, no other text or markdown
- Output language should match the transcript language

Output format:
[
  { "title": "...", "description": "...", "assignee": "...", "due_date": "YYYY-MM-DD" }
]

If no actionable tasks, return an empty array: []`;

export async function POST(req: NextRequest) {
  try {
    const { transcript, language } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract action items from this transcript:\n\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || 'Extraction failed' },
        { status: response.status }
      );
    }

    const message = await response.json();

    const responseText = message.content
      ?.filter((block: { type: string }) => block.type === 'text')
      .map((block: { type: string; text: string }) => block.text)
      .join('') || '';

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    // Extract JSON array if there's extra text
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) jsonStr = arrayMatch[0];

    const tasks = JSON.parse(jsonStr);

    if (!Array.isArray(tasks)) {
      throw new Error('Response is not an array');
    }

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    const message = error instanceof Error ? error.message : 'Extraction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
