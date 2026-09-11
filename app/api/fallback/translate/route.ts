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
        return NextResponse.json({ translatedText, provider: 'openai' });
      }
    }

    // FREE TRANSLATION PROVIDER 1: MyMemory Public Translation API (No Key Required)
    const sl = direction === 'en-to-fr' ? 'en' : 'fr';
    const tl = direction === 'en-to-fr' ? 'fr' : 'en';

    try {
      const myMemoryRes = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`
      );
      if (myMemoryRes.ok) {
        const mmData = await myMemoryRes.json();
        if (mmData.responseData?.translatedText) {
          return NextResponse.json({
            translatedText: mmData.responseData.translatedText,
            provider: 'mymemory-free',
            isFree: true,
          });
        }
      }
    } catch (e) {
      console.warn('MyMemory free translation failed, trying Google Translate free endpoint:', e);
    }

    // FREE TRANSLATION PROVIDER 2: Google Translate Public Client Endpoint (No Key Required)
    try {
      const gRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && gData[0] && gData[0][0] && gData[0][0][0]) {
          const translatedText = gData[0].map((item: string[]) => item[0]).join('');
          return NextResponse.json({
            translatedText,
            provider: 'google-free',
            isFree: true,
          });
        }
      }
    } catch (e) {
      console.warn('Google free translation failed:', e);
    }

    // Fallback dictionary
    const simpleFallbackTranslations: Record<string, string> = {
      "hello": "bonjour",
      "know": "savoir",
      "i know": "je sais",
      "how are you": "comment allez-vous",
      "how are you doing": "comment vas-tu",
      "can you send me the file": "peux-tu m'envoyer le fichier",
      "thank you": "merci",
      "thanks": "merci",
      "yes": "oui",
      "no": "non",
      "bonjour": "hello",
    };

    const lower = text.trim().toLowerCase();
    const mockMatch = simpleFallbackTranslations[lower];
    const translatedText = mockMatch || `[${targetLang}]: ${text}`;

    return NextResponse.json({ translatedText, isMock: true, isFree: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Translation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
