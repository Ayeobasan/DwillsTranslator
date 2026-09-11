'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Volume2, DollarSign } from 'lucide-react';
import { EngineType } from '@/lib/types/translator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  engine: EngineType;
  onEngineChange: (engine: EngineType) => void;
  voice: string;
  onVoiceChange: (voice: string) => void;
  autoDuck: boolean;
  onAutoDuckChange: (duck: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveApiKey,
  engine,
  onEngineChange,
  voice,
  onVoiceChange,
  autoDuck,
  onAutoDuckChange,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(userApiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(apiKeyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dwill Translate Settings</h2>
              <p className="text-xs text-zinc-400">API credentials, engine & audio preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4 text-sm">
          
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                OpenAI API Key (Optional)
              </span>
              <span className="text-[10px] text-zinc-500">Stored locally in browser</span>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-xs font-mono"
            />
            <p className="text-[11px] text-zinc-400 leading-normal">
              If omitted, Dwill Translate operates in 100% Free WebSpeech + Google Translate mode.
            </p>
          </div>

          {/* Engine Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Translation Engine Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onEngineChange('openai-realtime')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'openai-realtime'
                    ? 'bg-orange-950/40 border-orange-500 text-white shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold text-xs block text-orange-400">OpenAI Realtime (WebRTC)</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">Lowest latency (~300ms Speech-to-Speech)</span>
              </button>

              <button
                type="button"
                onClick={() => onEngineChange('webspeech-fallback')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'webspeech-fallback'
                    ? 'bg-orange-950/40 border-orange-500 text-white shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold text-xs block text-orange-400">Free WebSpeech Mode</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">100% Free Google + Browser TTS</span>
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Volume2 className="w-3.5 h-3.5 text-orange-400" />
              Target Output Voice
            </label>
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-orange-500"
            >
              <option value="alloy">Alloy (Balanced, Natural)</option>
              <option value="shimmer">Shimmer (Clear, Energetic)</option>
              <option value="echo">Echo (Soft, Conversational)</option>
              <option value="verse">Verse (Expressive)</option>
            </select>
          </div>

          {/* Interruption Option */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-white block">VAD Auto-Duck / Barge-In</span>
              <span className="text-[11px] text-zinc-400 block">
                Mute translation playback instantly when you speak
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoDuck}
              onChange={(e) => onAutoDuckChange(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-orange-600 focus:ring-orange-500"
            />
          </div>

        </div>

        {/* Cost & Info */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Free mode cost: $0.00. OpenAI WebRTC cost: ~$0.30/min.</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 transition-all"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};
