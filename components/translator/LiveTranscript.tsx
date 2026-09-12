'use client';

import React from 'react';
import { Volume2, Radio, Sparkles, Mic } from 'lucide-react';
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

  const isListening = connectionState === 'listening' || connectionState === 'connected';
  const isTranslating = connectionState === 'translating' || connectionState === 'playing';

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 my-4 sm:my-6">
      
      {/* Source Language Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[180px] sm:min-h-[260px] transition-all hover:border-zinc-700 group">
        <div>
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 mb-3.5 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-xl sm:text-2xl">{sourceFlag}</span>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">{sourceLangName}</h3>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">Spoken Input</span>
              </div>
            </div>

            {isListening ? (
              <span className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
                Listening
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-zinc-500 font-medium bg-zinc-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-zinc-800">
                Standby
              </span>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[120px] text-sm sm:text-base leading-relaxed">
            {finalOriginalText && (
              <p className="text-white font-normal">
                {finalOriginalText}
              </p>
            )}

            {liveOriginalText && (
              <p className="text-orange-300 font-light italic transition-opacity">
                "{liveOriginalText}"
              </p>
            )}

            {!finalOriginalText && !liveOriginalText && (
              <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center text-zinc-500">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                <p className="text-[11px] sm:text-xs font-normal text-zinc-400">
                  {isListening ? 'Speak into your microphone...' : 'Tap "Start Conversation" below'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 flex items-center justify-between border-t border-zinc-800/80">
          <span>INPUT CAPTURE</span>
          <span>{isEnToFr ? '24kHz • EN-US' : '24kHz • FR-FR'}</span>
        </div>
      </div>

      {/* Target Language Card */}
      <div className="bg-zinc-900/90 border border-orange-500/40 rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 shadow-2xl shadow-orange-950/20 backdrop-blur-xl flex flex-col justify-between min-h-[180px] sm:min-h-[260px] transition-all hover:border-orange-500/70">
        <div>
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 mb-3.5 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-xl sm:text-2xl">{targetFlag}</span>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">{targetLangName}</h3>
                <span className="text-[10px] sm:text-[11px] text-orange-400 font-mono">Dwill Translation</span>
              </div>
            </div>

            {isTranslating ? (
              <span className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-orange-300 font-medium bg-orange-500/10 border border-orange-500/30 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Translating
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-zinc-500 font-medium bg-zinc-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-zinc-800">
                Ready
              </span>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[120px] text-sm sm:text-base leading-relaxed">
            {finalTranslatedText && (
              <p className="text-white font-semibold text-base sm:text-lg">
                {finalTranslatedText}
              </p>
            )}

            {liveTranslatedText && (
              <p className="text-orange-200 font-light italic transition-opacity">
                "{liveTranslatedText}"
              </p>
            )}

            {!finalTranslatedText && !liveTranslatedText && (
              <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center text-zinc-500">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 text-zinc-600" />
                <p className="text-[11px] sm:text-xs font-normal text-zinc-400">
                  Translation will stream continuously here...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] font-mono text-orange-400/80 flex items-center justify-between border-t border-zinc-800/80">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Radio className="w-3 h-3 text-orange-500 animate-pulse" />
            VOICE OUTPUT
          </span>
          <span>{isEnToFr ? 'FR-FR OUTPUT' : 'EN-US OUTPUT'}</span>
        </div>
      </div>

    </div>
  );
};
