'use client';

import React from 'react';
import { ArrowLeftRight, Settings, AudioWaveform } from 'lucide-react';
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
    <header className="w-full bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/90 sticky top-0 z-30 px-4 py-3.5 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand: Dwill Translate */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <AudioWaveform className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                Dwill Translate
              </h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400">
                {engine === 'openai-realtime' ? 'WebRTC Realtime' : 'Free Mode'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-normal">Real-Time English ↔ French Voice Interpreter</p>
          </div>
        </div>

        {/* Direction Switcher Banner */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
          <button
            onClick={() => onDirectionChange('en-to-fr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isEnToFr
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span className="text-sm">🇬🇧</span>
            <span>English</span>
            <span className="text-zinc-500">→</span>
            <span className="text-sm">🇫🇷</span>
            <span>Français</span>
          </button>

          <button
            onClick={handleToggleDirection}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Swap translation direction"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDirectionChange('fr-to-en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              !isEnToFr
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span className="text-sm">🇫🇷</span>
            <span>Français</span>
            <span className="text-zinc-500">→</span>
            <span className="text-sm">🇬🇧</span>
            <span>English</span>
          </button>
        </div>

        {/* Mode Selector & Settings */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => onModeChange('conversation')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'conversation'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Conversation
            </button>
            <button
              onClick={() => onModeChange('push-to-talk')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'push-to-talk'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Push-To-Talk
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-orange-500/50 transition-all relative"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            {!hasApiKey && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
