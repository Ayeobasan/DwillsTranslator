import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, direction, apiKey } = await req.json();
    const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const sourceLang = direction === 'en-to-fr' ? 'English' : 'French';
    const targetLang = direction === 'en-to-fr' ? 'French' : 'English';

    // If API Key is present, translate via OpenAI REST
    if (effectiveKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a real-time translator. Translate the following text directly from ${sourceLang} to ${targetLang}. Output ONLY the translated text without commentary or quotes.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.choices[0]?.message?.content?.trim() || '';
        return NextResponse.json({ translatedText });
      }
    }

    // Keyless client fallback: Simulated simple dictionary / local transformation preview
    const simpleFallbackTranslations: Record<string, string> = {
      "hello": "bonjour",
      "how are you": "comment allez-vous",
      "how are you doing?": "comment vas-tu ?",
      "can you send me the file?": "peux-tu m'envoyer le fichier ?",
      "i'll join the meeting in ten minutes.": "je rejoindrai la réunion dans dix minutes.",
      "bonjour": "hello",
      "comment allez-vous": "how are you",
      "oui, je suis disponible demain.": "yes, I am available tomorrow.",
      "d'accord": "okay"
    };

    const lower = text.trim().toLowerCase();
    const mockMatch = simpleFallbackTranslations[lower];
    const translatedText = mockMatch || `[${targetLang}]: ${text}`;

    return NextResponse.json({ translatedText, isMock: !effectiveKey });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Translation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
