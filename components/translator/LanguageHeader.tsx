'use client';

import React from 'react';
import { ArrowLeftRight, Settings, Sparkles, Volume2 } from 'lucide-react';
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
    <header className="w-full bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-20 px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Instant Translator
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {engine === 'openai-realtime' ? 'WebRTC Realtime' : 'WebSpeech Fallback'}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Zero-latency simultaneous English ↔ French interpretation</p>
          </div>
        </div>

        {/* Direction Switcher Banner */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onDirectionChange('en-to-fr')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all ${
              isEnToFr
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇬🇧</span> English → <span className="text-base">🇫🇷</span> French
          </button>

          <button
            onClick={handleToggleDirection}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Swap translation direction"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDirectionChange('fr-to-en')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all ${
              !isEnToFr
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🇫🇷</span> French → <span className="text-base">🇬🇧</span> English
          </button>
        </div>

        {/* Mode Selector & Settings Button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onModeChange('conversation')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                mode === 'conversation'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conversation
            </button>
            <button
              onClick={() => onModeChange('push-to-talk')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                mode === 'push-to-talk'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Push-to-Talk
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
            {!hasApiKey && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
