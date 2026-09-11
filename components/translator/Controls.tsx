'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Square, Zap, RefreshCw, AlertCircle } from 'lucide-react';
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

  const isListening = connectionState === 'listening' || connectionState === 'connected';
  const isActive = connectionState !== 'idle' && connectionState !== 'error';

  const getStateBadge = () => {
    switch (connectionState) {
      case 'connecting':
        return { text: 'Connecting to Realtime API...', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'listening':
        return { text: 'Listening for Speech...', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'translating':
        return { text: 'Translating continuous audio...', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
      case 'playing':
        return { text: 'Playing voice translation...', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'reconnecting':
        return { text: 'Connection lost — reconnecting...', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'error':
        return { text: errorMessage || 'Connection error', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      default:
        return { text: 'Ready — Click to start continuous mode', color: 'bg-slate-800/80 text-slate-400 border-slate-700/80' };
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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 my-4 px-4">
      
      {/* Human Readable Status Banner */}
      <div className="flex items-center gap-3">
        <div className={`px-4 py-1.5 rounded-full border text-xs font-medium flex items-center gap-2 shadow-sm ${statusBadge.color}`}>
          {connectionState === 'connecting' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          {connectionState === 'listening' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          {connectionState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>{statusBadge.text}</span>
        </div>

        {latencyMetrics && latencyMetrics.totalMs > 0 && (
          <div className="px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{latencyMetrics.totalMs}ms latency</span>
          </div>
        )}
      </div>

      {/* Mode 1: Continuous Conversation Controls */}
      {mode === 'conversation' && (
        <div className="flex items-center gap-4">
          {!isActive ? (
            <button
              onClick={onStartListening}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span>Start Continuous Mode</span>
            </button>
          ) : (
            <button
              onClick={onStopListening}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-rose-400/40"
            >
              <Square className="w-5 h-5 text-white fill-current" />
              <span>Stop Session</span>
            </button>
          )}
        </div>
      )}

      {/* Mode 2: Push-to-Talk Buttons */}
      {mode === 'push-to-talk' && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* English -> French PTT Button */}
          <button
            onMouseDown={() => handlePttMouseDown('en-to-fr')}
            onMouseUp={handlePttMouseUp}
            onTouchStart={() => handlePttMouseDown('en-to-fr')}
            onTouchEnd={handlePttMouseUp}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border transition-all duration-150 select-none shadow-lg ${
              isPttPressed === 'en-to-fr'
                ? 'bg-indigo-600 border-indigo-400 text-white scale-95 shadow-indigo-500/40'
                : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>🇬🇧</span>
              <span>Speak English</span>
            </div>
            <span className="text-xs text-indigo-300/80">Translates to French 🇫🇷</span>
            <div className="mt-2 text-[11px] px-3 py-1 rounded-full bg-slate-950/60 border border-slate-700/60 text-slate-400">
              {isPttPressed === 'en-to-fr' ? 'Release to Send' : 'Hold / Tap to Speak'}
            </div>
          </button>

          {/* French -> English PTT Button */}
          <button
            onMouseDown={() => handlePttMouseDown('fr-to-en')}
            onMouseUp={handlePttMouseUp}
            onTouchStart={() => handlePttMouseDown('fr-to-en')}
            onTouchEnd={handlePttMouseUp}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border transition-all duration-150 select-none shadow-lg ${
              isPttPressed === 'fr-to-en'
                ? 'bg-purple-600 border-purple-400 text-white scale-95 shadow-purple-500/40'
                : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/50 text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>🇫🇷</span>
              <span>Parler Français</span>
            </div>
            <span className="text-xs text-purple-300/80">Translates to English 🇬🇧</span>
            <div className="mt-2 text-[11px] px-3 py-1 rounded-full bg-slate-950/60 border border-slate-700/60 text-slate-400">
              {isPttPressed === 'fr-to-en' ? 'Relâcher pour envoyer' : 'Maintenir pour parler'}
            </div>
          </button>

        </div>
      )}

    </div>
  );
};
