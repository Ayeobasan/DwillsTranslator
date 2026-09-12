'use client';

import React, { useState } from 'react';
import { Mic, Square, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { ConnectionState, LanguageDirection, LatencyMetrics, TranslationMode } from '@/lib/types/translator';

interface ControlsProps {
  mode: TranslationMode;
  connectionState: ConnectionState;
  direction: LanguageDirection;
  onDirectionChange: (newDir: LanguageDirection) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onPushToTalkStart: (dir: LanguageDirection) => void;
  onPushToTalkEnd: () => void;
  latencyMetrics: LatencyMetrics | null;
  errorMessage: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
  mode,
  connectionState,
  direction,
  onDirectionChange,
  onStartListening,
  onStopListening,
  onPushToTalkStart,
  onPushToTalkEnd,
  latencyMetrics,
  errorMessage,
}) => {
  const [isPttPressed, setIsPttPressed] = useState<LanguageDirection | null>(null);

  const isActive = connectionState !== 'idle' && connectionState !== 'error';

  const getStateBadge = () => {
    switch (connectionState) {
      case 'connecting':
        return { text: 'Establishing Dwill Session...', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'listening':
        return { text: 'Listening Live...', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'translating':
        return { text: 'Translating Speech...', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
      case 'playing':
        return { text: 'Speaking Translation...', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' };
      case 'reconnecting':
        return { text: 'Reconnecting session...', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'error':
        return { text: errorMessage || 'Connection error', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      default:
        return { text: 'Ready — Tap to speak', color: 'bg-zinc-900 text-zinc-400 border-zinc-800' };
    }
  };

  const statusBadge = getStateBadge();

  const handlePttMouseDown = (dir: LanguageDirection) => {
    setIsPttPressed(dir);
    onDirectionChange(dir);
    onPushToTalkStart(dir);
  };

  const handlePttMouseUp = () => {
    if (isPttPressed) {
      setIsPttPressed(null);
      onPushToTalkEnd();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 my-4 sm:my-6 px-3 sm:px-4">
      
      {/* Status Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        <div className={`px-3.5 py-1.5 rounded-full border text-[11px] sm:text-xs font-medium flex items-center gap-2 shadow-sm ${statusBadge.color}`}>
          {connectionState === 'connecting' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          {connectionState === 'listening' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          {connectionState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>{statusBadge.text}</span>
        </div>

        {latencyMetrics && latencyMetrics.totalMs > 0 && (
          <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-orange-400 text-[11px] sm:text-xs font-mono flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{latencyMetrics.totalMs}ms latency</span>
          </div>
        )}
      </div>

      {/* Mode 1: Continuous Conversation Button */}
      {mode === 'conversation' && (
        <div className="w-full sm:w-auto flex items-center justify-center">
          {!isActive ? (
            <button
              onClick={onStartListening}
              className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-7 sm:px-9 py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-orange-600/30 active:scale-95 transition-all duration-150 min-h-[54px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              </div>
              <span>Start Dwill Conversation</span>
            </button>
          ) : (
            <button
              onClick={onStopListening}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 sm:px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/20 active:scale-95 transition-all duration-150 border border-rose-400/30 min-h-[54px]"
            >
              <Square className="w-4 h-4 text-white fill-current shrink-0" />
              <span>Stop Session</span>
            </button>
          )}
        </div>
      )}

      {/* Mode 2: Push-to-Talk Buttons */}
      {mode === 'push-to-talk' && (
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* English -> French PTT Button */}
          <button
            onMouseDown={() => handlePttMouseDown('en-to-fr')}
            onMouseUp={handlePttMouseUp}
            onTouchStart={() => handlePttMouseDown('en-to-fr')}
            onTouchEnd={handlePttMouseUp}
            className={`flex flex-col items-center justify-center gap-1.5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-150 select-none shadow-xl min-h-[110px] ${
              isPttPressed === 'en-to-fr'
                ? 'bg-gradient-to-br from-orange-600 to-amber-600 border-orange-400 text-white scale-95 shadow-orange-600/40'
                : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 text-white active:bg-zinc-850'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold">
              <span>🇬🇧</span>
              <span>English</span>
            </div>
            <span className="text-[11px] sm:text-xs text-zinc-400">To French 🇫🇷</span>
            <div className="mt-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-mono">
              {isPttPressed === 'en-to-fr' ? 'Recording...' : 'Hold / Tap'}
            </div>
          </button>

          {/* French -> English PTT Button */}
          <button
            onMouseDown={() => handlePttMouseDown('fr-to-en')}
            onMouseUp={handlePttMouseUp}
            onTouchStart={() => handlePttMouseDown('fr-to-en')}
            onTouchEnd={handlePttMouseUp}
            className={`flex flex-col items-center justify-center gap-1.5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-150 select-none shadow-xl min-h-[110px] ${
              isPttPressed === 'fr-to-en'
                ? 'bg-gradient-to-br from-orange-600 to-amber-600 border-orange-400 text-white scale-95 shadow-orange-600/40'
                : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 text-white active:bg-zinc-850'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold">
              <span>🇫🇷</span>
              <span>Français</span>
            </div>
            <span className="text-[11px] sm:text-xs text-zinc-400">To English 🇬🇧</span>
            <div className="mt-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-mono">
              {isPttPressed === 'fr-to-en' ? 'Recording...' : 'Maintenir'}
            </div>
          </button>

        </div>
      )}

    </div>
  );
};
