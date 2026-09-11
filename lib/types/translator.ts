export type LanguageCode = 'en' | 'fr';

export type LanguageDirection = 'en-to-fr' | 'fr-to-en';

export type TranslationMode = 'conversation' | 'push-to-talk';

export type EngineType = 'openai-realtime' | 'webspeech-fallback';

export type ConnectionState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'translating'
  | 'playing'
  | 'reconnecting'
  | 'error';

export interface TranscriptItem {
  id: string;
  timestamp: number;
  speakerDirection: LanguageDirection;
  originalLanguage: LanguageCode;
  translatedLanguage: LanguageCode;
  originalText: string;
  translatedText: string;
  isFinal: boolean;
  audioDurationSec?: number;
}

export interface LatencyMetrics {
  sttMs: number;
  translationMs: number;
  ttsMs: number;
  totalMs: number;
  lastUpdated: number;
}

export interface RealtimeSessionConfig {
  apiKey?: string;
  model?: string;
  voice?: 'alloy' | 'echo' | 'shimmer' | 'verse';
  instructions?: string;
  temperature?: number;
}

export interface ErrorState {
  code: string;
  message: string;
  timestamp: number;
}
