'use client';

import React from 'react';
import { Volume2, History, Trash2, ArrowRight, Clock } from 'lucide-react';
import { TranscriptItem } from '@/lib/types/translator';

interface ConversationHistoryProps {
  history: TranscriptItem[];
  onClearHistory: () => void;
  onPlayAudio?: (item: TranscriptItem) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  history,
  onClearHistory,
  onPlayAudio,
}) => {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto my-6 p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center">
        <History className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">No conversation transcripts recorded yet.</p>
        <p className="text-[11px] text-slate-500 mt-1">Spoken sentences and their live translations will appear here in chronological order.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Conversation History ({history.length})
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 text-xs font-medium transition-all border border-slate-700/60"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Log</span>
        </button>
      </div>

      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => {
          const isEnToFr = item.speakerDirection === 'en-to-fr';
          const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-slate-200">{isEnToFr ? '🇬🇧 Speaker (English)' : '🇫🇷 Speaker (Français)'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-indigo-400 font-mono">
                    {isEnToFr ? '🇫🇷 Interpretation' : '🇬🇧 Interpretation'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{timeStr}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Original Speech ({item.originalLanguage.toUpperCase()})
                  </span>
                  <p className="text-slate-200 font-normal leading-relaxed">{item.originalText}</p>
                </div>
                <div className="sm:border-l sm:border-slate-800/80 sm:pl-4">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase block mb-1">
                    Translated Output ({item.translatedLanguage.toUpperCase()})
                  </span>
                  <p className="text-white font-medium leading-relaxed">{item.translatedText}</p>
                </div>
              </div>

              {onPlayAudio && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onPlayAudio(item)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 text-xs transition-colors border border-slate-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
