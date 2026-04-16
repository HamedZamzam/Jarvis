import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 400 });
    }

    // Use native fetch instead of OpenAI SDK to avoid node-fetch ECONNRESET
    const openaiForm = new FormData();
    openaiForm.append('file', audioFile, 'recording.webm');
    openaiForm.append('model', 'whisper-1');
    openaiForm.append('language', language === 'ar' ? 'ar' : 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiForm,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Transcription failed' } }));
      return NextResponse.json(
        { error: err.error?.message || 'Transcription failed' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text,
      language,
    });
  } catch (error: unknown) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
