'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Volume2, ShieldCheck, DollarSign } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Translator Settings</h2>
              <p className="text-xs text-slate-400">API credentials, engine & audio preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-sm">
          
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                OpenAI API Key (Optional Client Override)
              </span>
              <span className="text-[10px] text-slate-500">Stored in browser localStorage</span>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              If provided, this key overrides server `.env.local` for WebRTC sessions.
            </p>
          </div>

          {/* Engine Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Translation Engine Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onEngineChange('openai-realtime')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'openai-realtime'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs block text-indigo-300">OpenAI Realtime (WebRTC)</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Lowest latency (~300ms Speech-to-Speech)</span>
              </button>

              <button
                type="button"
                onClick={() => onEngineChange('webspeech-fallback')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'webspeech-fallback'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs block text-indigo-300">WebSpeech + REST Fallback</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Keyless browser fallback mode</span>
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              Target Output Voice
            </label>
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="alloy">Alloy (Balanced, Natural)</option>
              <option value="shimmer">Shimmer (Clear, Energetic)</option>
              <option value="echo">Echo (Soft, Conversational)</option>
              <option value="verse">Verse (Expressive)</option>
            </select>
          </div>

          {/* Interruption / Barge-in Option */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">VAD Auto-Duck / Barge-In</span>
              <span className="text-[11px] text-slate-400 block">
                Mute translation playback instantly when you speak
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoDuck}
              onChange={(e) => onAutoDuckChange(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* Cost & Info footer */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Estimated API cost: ~$0.30 per minute of continuous Speech-to-Speech interpretation.</span>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};
