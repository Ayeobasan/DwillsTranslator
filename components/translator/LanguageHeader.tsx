'use client';

import React from 'react';
import { ArrowLeftRight, Settings, Radio, Sparkles, AudioWaveform } from 'lucide-react';
import { EngineType, LanguageDirection, TranslationMode } from '@/lib/types/translator';

interface LanguageHeaderProps {
  direction: LanguageDirection;
  onDirectionChange: (newDirection: LanguageDirection) => void;
  mode: TranslationMode;
  onModeChange: (newMode: TranslationMode) => void;
  engine: EngineType;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const LanguageHeader: React.FC<LanguageHeaderProps> = ({
  direction,
  onDirectionChange,
  mode,
  onModeChange,
  engine,
  onOpenSettings,
  hasApiKey,
}) => {
  const isEnToFr = direction === 'en-to-fr';

  const handleToggleDirection = () => {
    onDirectionChange(isEnToFr ? 'fr-to-en' : 'en-to-fr');
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3.5 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner relative group">
            <AudioWaveform className="w-5 h-5 text-indigo-400 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-slate-100">
                LingoStream Live
              </h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300">
                {engine === 'openai-realtime' ? 'WebRTC Low-Latency' : 'Free WebSpeech Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Real-Time Conversational Interpreter</p>
          </div>
        </div>

        {/* Center: Language Segment Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-2xl">
          <button
            onClick={() => onDirectionChange('en-to-fr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isEnToFr
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <span>English</span>
            <span className="text-slate-400">→</span>
            <span className="text-sm">🇫🇷</span>
            <span>Français</span>
          </button>

          <button
            onClick={handleToggleDirection}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Swap translation direction"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDirectionChange('fr-to-en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              !isEnToFr
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-sm">🇫🇷</span>
            <span>Français</span>
            <span className="text-slate-400">→</span>
            <span className="text-sm">🇬🇧</span>
            <span>English</span>
          </button>
        </div>

        {/* Right: Mode & Config */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onModeChange('conversation')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'conversation'
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conversation
            </button>
            <button
              onClick={() => onModeChange('push-to-talk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'push-to-talk'
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Push-To-Talk
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all relative"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            {!hasApiKey && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
