import { ConnectionState, LanguageDirection, LatencyMetrics } from '../types/translator';

// Minimal WebSpeech TypeScript declarations
interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: ISpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export interface WebSpeechFallbackCallbacks {
  onStateChange?: (state: ConnectionState) => void;
  onTranscriptDelta?: (speaker: 'user' | 'translator', deltaText: string) => void;
  onTranscriptFinal?: (
    speaker: 'user' | 'translator',
    text: string,
    direction: LanguageDirection
  ) => void;
  onLatencyUpdate?: (metrics: Partial<LatencyMetrics>) => void;
  onError?: (error: string) => void;
}

export class WebSpeechFallbackEngine {
  private recognition: ISpeechRecognition | null = null;
  private callbacks: WebSpeechFallbackCallbacks = {};
  private direction: LanguageDirection = 'en-to-fr';
  private isRunning = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private userApiKey?: string;

  constructor(callbacks?: WebSpeechFallbackCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  public async start(direction: LanguageDirection, userApiKey?: string): Promise<boolean> {
    if (!this.isSupported()) {
      if (this.callbacks.onError) {
        this.callbacks.onError('WebSpeech API is not supported in this browser environment.');
      }
      return false;
    }

    this.direction = direction;
    this.userApiKey = userApiKey;
    this.isRunning = true;

    try {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        throw new Error('Speech recognition class unavailable');
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.direction === 'en-to-fr' ? 'en-US' : 'fr-FR';

      this.recognition.onstart = () => {
        this.notifyState('listening');
      };

      this.recognition.onresult = async (event: ISpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (interimTranscript && this.callbacks.onTranscriptDelta) {
          this.callbacks.onTranscriptDelta('user', interimTranscript);
        }

        if (finalTranscript.trim()) {
          if (this.callbacks.onTranscriptFinal) {
            this.callbacks.onTranscriptFinal('user', finalTranscript.trim(), this.direction);
          }
          await this.processTranslationAndTTS(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.warn('WebSpeech Recognition error:', event.error);
        if (event.error !== 'no-speech' && this.callbacks.onError) {
          this.callbacks.onError(`Speech recognition notice: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.isRunning && this.recognition) {
          // Restart loop for continuous speech recognition
          try {
            this.recognition.start();
          } catch (e) {
            console.warn('Could not auto-restart recognition:', e);
          }
        } else {
          this.notifyState('idle');
        }
      };

      this.recognition.start();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'WebSpeech initialization failed';
      if (this.callbacks.onError) this.callbacks.onError(msg);
      this.notifyState('error');
      return false;
    }
  }

  public updateDirection(newDirection: LanguageDirection) {
    this.direction = newDirection;
    if (this.recognition && this.isRunning) {
      this.recognition.lang = newDirection === 'en-to-fr' ? 'en-US' : 'fr-FR';
    }
  }

  private async processTranslationAndTTS(text: string) {
    const startTime = Date.now();
    this.notifyState('translating');

    try {
      // 1. Translation call
      const transRes = await fetch('/api/fallback/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          direction: this.direction,
          apiKey: this.userApiKey,
        }),
      });

      const transData = await transRes.json();
      const translatedText = transData.translatedText || text;

      const tTranslate = Date.now();

      if (this.callbacks.onTranscriptFinal) {
        this.callbacks.onTranscriptFinal('translator', translatedText, this.direction);
      }

      // 2. TTS Generation / Playback
      this.notifyState('playing');
      const voice = this.direction === 'en-to-fr' ? 'alloy' : 'shimmer';

      if (this.userApiKey) {
        const ttsRes = await fetch('/api/fallback/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: translatedText,
            voice,
            apiKey: this.userApiKey,
          }),
        });

        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const audioUrl = URL.createObjectURL(blob);
          this.currentAudioElement = new Audio(audioUrl);
          await this.currentAudioElement.play();
        } else {
          this.speakBrowserSynthesis(translatedText);
        }
      } else {
        this.speakBrowserSynthesis(translatedText);
      }

      const tEnd = Date.now();

      if (this.callbacks.onLatencyUpdate) {
        this.callbacks.onLatencyUpdate({
          sttMs: Math.round(tTranslate - startTime),
          translationMs: Math.round(tTranslate - startTime),
          ttsMs: Math.round(tEnd - tTranslate),
          totalMs: tEnd - startTime,
          lastUpdated: Date.now(),
        });
      }

      this.notifyState('listening');
    } catch (err: unknown) {
      console.error('Fallback processing error:', err);
      this.notifyState('listening');
    }
  }

  private speakBrowserSynthesis(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLangPrefix = this.direction === 'en-to-fr' ? 'fr' : 'en';
      utterance.lang = this.direction === 'en-to-fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      // Select explicit matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matched = voices.find(
          (v) => v.lang.toLowerCase().startsWith(targetLangPrefix) || v.lang.toLowerCase().includes(targetLangPrefix)
        );
        if (matched) {
          utterance.voice = matched;
        }
      }

      utterance.onstart = () => {
        this.notifyState('playing');
      };

      utterance.onend = () => {
        this.notifyState('listening');
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis utterance notice:', err);
        this.notifyState('listening');
      };

      // Keep utterance reference globally to avoid Chrome garbage collection bug
      (window as unknown as { _activeUtterance?: SpeechSynthesisUtterance })._activeUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      this.notifyState('listening');
    }
  }

  public handleBargeIn(force = false) {
    if (force) {
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  private notifyState(state: ConnectionState) {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(state);
    }
  }

  public stop() {
    this.isRunning = false;
    this.handleBargeIn();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      this.recognition = null;
    }
    this.notifyState('idle');
  }
}
