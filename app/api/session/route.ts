import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        hasApiKey: false,
        fallbackRequired: true,
        message: 'OPENAI_API_KEY is unconfigured. Free WebSpeech + Google Translate fallback mode is active.'
      }, { status: 200 });
    }

    const direction: 'en-to-fr' | 'fr-to-en' = body.direction || 'en-to-fr';
    const voice = body.voice || 'alloy';

    const systemPrompt = direction === 'en-to-fr'
      ? `You are an instantaneous simultaneous voice interpreter from English to French. 
RULES :
1. Translate incoming English speech into French IMMEDIATELY as audio and text.
2. Keep translations concise, direct, natural, and conversational.
3. Do NOT add pleasantries or extra comments. Translate ONLY what the user said.
4. Output French audio and matching transcript.`
      : `You are an instantaneous simultaneous voice interpreter from French to English. 
RULES:
1. Translate incoming French speech into English IMMEDIATELY as audio and text.
2. Keep translations concise, direct, natural, and conversational.
3. Do NOT add pleasantries or extra comments. Translate ONLY what the user said.
4. Output English audio and matching transcript.`;

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17',
        voice: voice,
        instructions: systemPrompt,
        modalities: ['audio', 'text'],
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.4,
          prefix_padding_ms: 200,
          silence_duration_ms: 350,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Realtime session error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `OpenAI API returned status ${response.status}`,
          details: errorText,
          fallbackRequired: true
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      client_secret: data.client_secret,
      session: data,
      hasApiKey: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message, fallbackRequired: true },
      { status: 500 }
    );
  }
}
