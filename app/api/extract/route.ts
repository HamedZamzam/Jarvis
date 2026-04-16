import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { transcript, language } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const systemPrompt = `You are Jarvis, a smart task extraction assistant. Your job is to extract clear, actionable tasks from voice transcripts.

Rules:
- Extract ONLY actionable tasks (things someone needs to DO)
- Each task should have a clear, concise title
- If a person is mentioned as responsible, include them as assignee
- If a deadline or date is mentioned, include it as due_date in YYYY-MM-DD format
- If description adds useful context beyond the title, include it
- Respond ONLY with a valid JSON array, no other text
- Output language should match the transcript language

Output format:
[
  {
    "title": "string (concise action title)",
    "description": "string or null (extra context if needed)",
    "assignee": "string or null (person responsible)",
    "due_date": "string YYYY-MM-DD or null"
  }
]

If no actionable tasks are found, return an empty array: []`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Extract action items from this transcript:\n\n${transcript}`,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => {
        if (block.type === 'text') return block.text;
        return '';
      })
      .join('');

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

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
