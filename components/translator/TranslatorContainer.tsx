'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageHeader } from './LanguageHeader';
import { LiveTranscript } from './LiveTranscript';
import { AudioVisualizer } from './AudioVisualizer';
import { Controls } from './Controls';
import { ConversationHistory } from './ConversationHistory';
import { SettingsModal } from './SettingsModal';
import { AudioProcessor } from '@/lib/realtime/audio-processor';
import { OpenAIRealtimeWebRTC } from '@/lib/realtime/webrtc-client';
import { WebSpeechFallbackEngine } from '@/lib/realtime/webspeech-fallback';
import {
  ConnectionState,
  EngineType,
  LanguageDirection,
  LatencyMetrics,
  TranscriptItem,
  TranslationMode,
} from '@/lib/types/translator';

export const TranslatorContainer: React.FC = () => {
  // Application State
  const [direction, setDirection] = useState<LanguageDirection>('en-to-fr');
  const [mode, setMode] = useState<TranslationMode>('conversation');
  const [engine, setEngine] = useState<EngineType>('openai-realtime');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const [liveOriginalText, setLiveOriginalText] = useState('');
  const [liveTranslatedText, setLiveTranslatedText] = useState('');
  const [finalOriginalText, setFinalOriginalText] = useState('');
  const [finalTranslatedText, setFinalTranslatedText] = useState('');

  const [history, setHistory] = useState<TranscriptItem[]>([]);
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetrics | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [autoDuck, setAutoDuck] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasApiKeyOnServer, setHasApiKeyOnServer] = useState(false);

  // Audio & Engines References
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const webrtcClientRef = useRef<OpenAIRealtimeWebRTC | null>(null);
  const webspeechFallbackRef = useRef<WebSpeechFallbackEngine | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Check initial API Key availability on server
  useEffect(() => {
    fetch('/api/session', { method: 'POST', body: JSON.stringify({}) })
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey) {
          setHasApiKeyOnServer(true);
        } else {
          setEngine('webspeech-fallback');
        }
      })
      .catch(() => {
        setEngine('webspeech-fallback');
      });

    const savedKey = localStorage.getItem('translator_openai_key');
    if (savedKey) {
      setUserApiKey(savedKey);
      setEngine('openai-realtime');
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('translator_openai_key', key);
      setEngine('openai-realtime');
    } else {
      localStorage.removeItem('translator_openai_key');
    }
  };

  const handleTranscriptDelta = useCallback((speaker: 'user' | 'translator', deltaText: string) => {
    if (speaker === 'user') {
      setLiveOriginalText(deltaText);
    } else {
      setLiveTranslatedText(deltaText);
    }
  }, []);

  const handleTranscriptFinal = useCallback((
    speaker: 'user' | 'translator',
    text: string,
    dir: LanguageDirection
  ) => {
    if (speaker === 'user') {
      setFinalOriginalText(text);
      setLiveOriginalText('');
    } else {
      setFinalTranslatedText(text);
      setLiveTranslatedText('');

      // Add complete item to conversation history
      setHistory((prev) => [
        {
          id: `item-${Date.now()}`,
          timestamp: Date.now(),
          speakerDirection: dir,
          originalLanguage: dir === 'en-to-fr' ? 'en' : 'fr',
          translatedLanguage: dir === 'en-to-fr' ? 'fr' : 'en',
          originalText: finalOriginalText || text,
          translatedText: text,
          isFinal: true,
        },
        ...prev,
      ]);
    }
  }, [finalOriginalText]);

  // Interruption barge-in handler
  const handleBargeIn = useCallback(() => {
    if (autoDuck) {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.handleBargeIn();
      }
      if (webspeechFallbackRef.current) {
        webspeechFallbackRef.current.handleBargeIn();
      }
    }
  }, [autoDuck]);

  // Start Real-Time Session
  const startSession = async (overrideDirection?: LanguageDirection) => {
    setErrorMessage(null);
    const activeDir = overrideDirection || direction;

    try {
      // 1. Initialize Audio Capture & Processor
      audioProcessorRef.current = new AudioProcessor({
        onSpeechStarted: () => {
          handleBargeIn();
        },
      });

      const mediaStream = await audioProcessorRef.current.startCapture();
      setAnalyser(audioProcessorRef.current.getAnalyser());

      // 2. Connect according to engine
      if (engine === 'openai-realtime') {
        webrtcClientRef.current = new OpenAIRealtimeWebRTC({
          onStateChange: (st) => setConnectionState(st),
          onTranscriptDelta: handleTranscriptDelta,
          onTranscriptFinal: handleTranscriptFinal,
          onLatencyUpdate: (m) => {
            setLatencyMetrics((prev) => ({
              sttMs: m.sttMs ?? prev?.sttMs ?? 0,
              translationMs: m.translationMs ?? prev?.translationMs ?? 0,
              ttsMs: m.ttsMs ?? prev?.ttsMs ?? 0,
              totalMs: m.totalMs ?? prev?.totalMs ?? 0,
              lastUpdated: Date.now(),
            }));
          },
          onError: (err) => {
            setErrorMessage(err);
            // Fallback automatically if WebRTC fails
            setEngine('webspeech-fallback');
          },
        });

        const success = await webrtcClientRef.current.connect(mediaStream, activeDir, userApiKey);
        if (!success) {
          console.warn('WebRTC failed, switching to WebSpeech fallback');
          startFallbackSession(activeDir);
        }
      } else {
        startFallbackSession(activeDir);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setErrorMessage(msg);
      setConnectionState('error');
    }
  };

  const startFallbackSession = (dir: LanguageDirection) => {
    webspeechFallbackRef.current = new WebSpeechFallbackEngine({
      onStateChange: (st) => setConnectionState(st),
      onTranscriptDelta: handleTranscriptDelta,
      onTranscriptFinal: handleTranscriptFinal,
      onLatencyUpdate: (m) => {
        setLatencyMetrics((prev) => ({
          sttMs: m.sttMs ?? prev?.sttMs ?? 0,
          translationMs: m.translationMs ?? prev?.translationMs ?? 0,
          ttsMs: m.ttsMs ?? prev?.ttsMs ?? 0,
          totalMs: m.totalMs ?? prev?.totalMs ?? 0,
          lastUpdated: Date.now(),
        }));
      },
      onError: (err) => setErrorMessage(err),
    });

    webspeechFallbackRef.current.start(dir, userApiKey);
  };

  // Stop Session & Cleanup
  const stopSession = () => {
    if (webrtcClientRef.current) {
      webrtcClientRef.current.disconnect();
      webrtcClientRef.current = null;
    }

    if (webspeechFallbackRef.current) {
      webspeechFallbackRef.current.stop();
      webspeechFallbackRef.current = null;
    }

    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopCapture();
      audioProcessorRef.current = null;
    }

    setAnalyser(null);
    setConnectionState('idle');
  };

  // Update direction dynamically
  const handleDirectionChange = (newDir: LanguageDirection) => {
    setDirection(newDir);
    setLiveOriginalText('');
    setLiveTranslatedText('');

    if (webrtcClientRef.current) {
      webrtcClientRef.current.updateDirection(newDir);
    }
    if (webspeechFallbackRef.current) {
      webspeechFallbackRef.current.updateDirection(newDir);
    }
  };

  // Push to Talk Handlers
  const handlePttStart = (dir: LanguageDirection) => {
    startSession(dir);
  };

  const handlePttEnd = () => {
    stopSession();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <LanguageHeader
        direction={direction}
        onDirectionChange={handleDirectionChange}
        mode={mode}
        onModeChange={(m) => {
          stopSession();
          setMode(m);
        }}
        engine={engine}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKeyOnServer || !!userApiKey}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col justify-center">
        
        {/* Live Audio Visualizer */}
        <AudioVisualizer
          analyser={analyser}
          isActive={connectionState !== 'idle' && connectionState !== 'error'}
          state={connectionState}
        />

        {/* Live & Final Transcripts */}
        <LiveTranscript
          direction={direction}
          connectionState={connectionState}
          liveOriginalText={liveOriginalText}
          liveTranslatedText={liveTranslatedText}
          finalOriginalText={finalOriginalText}
          finalTranslatedText={finalTranslatedText}
        />

        {/* Dynamic Controls & Push to talk */}
        <Controls
          mode={mode}
          connectionState={connectionState}
          direction={direction}
          onDirectionChange={handleDirectionChange}
          onStartListening={() => startSession()}
          onStopListening={stopSession}
          onPushToTalkStart={handlePttStart}
          onPushToTalkEnd={handlePttEnd}
          latencyMetrics={latencyMetrics}
          errorMessage={errorMessage}
        />

        {/* Conversation History */}
        <ConversationHistory
          history={history}
          onClearHistory={() => setHistory([])}
        />
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Continuous English ↔ French Real-Time Voice Interpreter • Powered by OpenAI Realtime WebRTC
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userApiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        engine={engine}
        onEngineChange={(e) => {
          stopSession();
          setEngine(e);
        }}
        voice={voice}
        onVoiceChange={setVoice}
        autoDuck={autoDuck}
        onAutoDuckChange={setAutoDuck}
      />
    </div>
  );
};
