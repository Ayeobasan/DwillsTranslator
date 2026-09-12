import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy', direction = 'en-to-fr', apiKey } = await req.json();
    const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 1. If OpenAI API Key is present, use OpenAI tts-1 neural audio
    if (effectiveKey) {
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

      if (response.ok) {
        const audioArrayBuffer = await response.arrayBuffer();
        return new NextResponse(audioArrayBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
          },
        });
      }
    }

    // 2. FREE TTS PROVIDER: Google Translate Public Neural TTS (Vercel Serverless Compatible)
    const targetLang = direction === 'en-to-fr' ? 'fr' : 'en';
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(text.substring(0, 200))}`;

    const gResponse = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (gResponse.ok) {
      const audioArrayBuffer = await gResponse.arrayBuffer();
      return new NextResponse(audioArrayBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json({ error: 'TTS audio unavailable' }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS process error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
