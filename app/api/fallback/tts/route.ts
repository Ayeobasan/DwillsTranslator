import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy', apiKey } = await req.json();
    const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!effectiveKey) {
      return NextResponse.json(
        { error: 'No API key available for OpenAI TTS' },
        { status: 400 }
      );
    }
    // okok 
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `TTS Error: ${response.status}`, details: errText },
        { status: response.status }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return new NextResponse(audioArrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS process error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
