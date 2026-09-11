'use client';

import React from 'react';
import { Volume2, Sparkles, Languages } from 'lucide-react';
import { ConnectionState, LanguageDirection } from '@/lib/types/translator';

interface LiveTranscriptProps {
  direction: LanguageDirection;
  connectionState: ConnectionState;
  liveOriginalText: string;
  liveTranslatedText: string;
  finalOriginalText: string;
  finalTranslatedText: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  direction,
  connectionState,
  liveOriginalText,
  liveTranslatedText,
  finalOriginalText,
  finalTranslatedText,
}) => {
  const isEnToFr = direction === 'en-to-fr';

  const sourceLangName = isEnToFr ? 'English' : 'Français';
  const sourceFlag = isEnToFr ? '🇬🇧' : '🇫🇷';

  const targetLangName = isEnToFr ? 'Français' : 'English';
  const targetFlag = isEnToFr ? '🇫🇷' : '🇬🇧';

  const isListening = connectionState === 'listening';
  const isTranslating = connectionState === 'translating' || connectionState === 'playing';

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      
      {/* Source Language Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between min-h-[220px] transition-all hover:border-slate-700/80">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{sourceFlag}</span>
              <span className="font-semibold text-sm text-slate-200 uppercase tracking-wider">
                {sourceLangName}
              </span>
            </div>
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Speaking...
              </span>
            )}
          </div>

          <div className="space-y-2 min-h-[100px] text-base leading-relaxed">
            {finalOriginalText && (
              <p className="text-slate-100 font-normal">
                {finalOriginalText}
              </p>
            )}

            {liveOriginalText && (
              <p className="text-indigo-300/80 font-light italic transition-opacity">
                "{liveOriginalText}"
              </p>
            )}

            {!finalOriginalText && !liveOriginalText && (
              <p className="text-slate-500 text-sm italic">
                {isListening ? 'Listening for speech...' : 'Click "Start Listening" or hold Push-to-Talk to speak...'}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/40">
          <span>Input Microphone</span>
          <span className="font-mono">{isEnToFr ? 'en-US' : 'fr-FR'}</span>
        </div>
      </div>

      {/* Target Language Card */}
      <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 shadow-xl shadow-indigo-950/20 backdrop-blur-md flex flex-col justify-between min-h-[220px] transition-all hover:border-indigo-500/50">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-indigo-900/40 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{targetFlag}</span>
              <span className="font-semibold text-sm text-indigo-200 uppercase tracking-wider">
                {targetLangName} Translation
              </span>
            </div>
            {isTranslating && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Streaming Translation
              </span>
            )}
          </div>

          <div className="space-y-2 min-h-[100px] text-base leading-relaxed">
            {finalTranslatedText && (
              <p className="text-indigo-50 font-medium">
                {finalTranslatedText}
              </p>
            )}

            {liveTranslatedText && (
              <p className="text-indigo-200/90 font-light italic transition-opacity">
                "{liveTranslatedText}"
              </p>
            )}

            {!finalTranslatedText && !liveTranslatedText && (
              <p className="text-indigo-300/40 text-sm italic">
                Translation will stream continuously here as you speak...
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 text-xs text-indigo-300/50 flex items-center justify-between border-t border-indigo-900/40">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            Instant Voice Playback
          </span>
          <span className="font-mono">{isEnToFr ? 'fr-FR' : 'en-US'}</span>
        </div>
      </div>

    </div>
  );
};
