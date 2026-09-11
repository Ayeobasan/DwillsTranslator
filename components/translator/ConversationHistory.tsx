'use client';

import React from 'react';
import { Volume2, History, Trash2, ArrowRight } from 'lucide-react';
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
      <div className="w-full max-w-4xl mx-auto my-6 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-400">No conversation history yet.</p>
        <p className="text-xs text-slate-500 mt-1">Spoken phrases and their streaming translations will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Conversation History ({history.length})
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-medium transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
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
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2 font-medium">
                  <span>{isEnToFr ? '🇬🇧 John' : '🇫🇷 Teammate'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-indigo-400">
                    {isEnToFr ? '🇫🇷 French Output' : '🇬🇧 English Output'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{timeStr}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">
                    Original ({item.originalLanguage})
                  </span>
                  <p className="text-slate-300">{item.originalText}</p>
                </div>
                <div className="sm:border-l sm:border-slate-800/80 sm:pl-3">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase block mb-0.5">
                    Translated ({item.translatedLanguage})
                  </span>
                  <p className="text-indigo-200 font-medium">{item.translatedText}</p>
                </div>
              </div>

              {onPlayAudio && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onPlayAudio(item)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-300 text-xs transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Audio</span>
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
