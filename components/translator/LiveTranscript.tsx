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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
      
      {/* Source Language Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[260px] transition-all hover:border-slate-700/80 group">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{sourceFlag}</span>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">{sourceLangName}</h3>
                <span className="text-[11px] text-slate-500 font-mono">Spoken Audio Input</span>
              </div>
            </div>

            {isListening ? (
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Listening Live
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Standby
              </span>
            )}
          </div>

          <div className="space-y-3 min-h-[120px] text-base leading-relaxed">
            {finalOriginalText && (
              <p className="text-slate-100 font-medium">
                {finalOriginalText}
              </p>
            )}

            {liveOriginalText && (
              <p className="text-indigo-300/90 font-light italic transition-opacity">
                "{liveOriginalText}"
              </p>
            )}

            {!finalOriginalText && !liveOriginalText && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <Mic className="w-6 h-6 mb-2 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                <p className="text-xs font-normal">
                  {isListening ? 'Speak into your microphone...' : 'Click "Start Conversation" below to speak'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/80">
          <span>MICROPHONE CAPTURE</span>
          <span>{isEnToFr ? '24kHz • EN-US' : '24kHz • FR-FR'}</span>
        </div>
      </div>

      {/* Target Language Card */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[260px] transition-all hover:border-indigo-500/60">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{targetFlag}</span>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">{targetLangName}</h3>
                <span className="text-[11px] text-indigo-400 font-mono">Live Simultaneous Stream</span>
              </div>
            </div>

            {isTranslating ? (
              <span className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Streaming Translation
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                Ready
              </span>
            )}
          </div>

          <div className="space-y-3 min-h-[120px] text-base leading-relaxed">
            {finalTranslatedText && (
              <p className="text-white font-medium">
                {finalTranslatedText}
              </p>
            )}

            {liveTranslatedText && (
              <p className="text-indigo-200/90 font-light italic transition-opacity">
                "{liveTranslatedText}"
              </p>
            )}

            {!finalTranslatedText && !liveTranslatedText && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <Volume2 className="w-6 h-6 mb-2 text-slate-600" />
                <p className="text-xs font-normal">
                  Translation will stream and play out loud instantly...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 text-[11px] font-mono text-indigo-400/70 flex items-center justify-between border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
            SYNTHESIZED AUDIO OUTPUT
          </span>
          <span>{isEnToFr ? 'FR-FR PLAYBACK' : 'EN-US PLAYBACK'}</span>
        </div>
      </div>

    </div>
  );
};
