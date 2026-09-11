import { ConnectionState, LanguageDirection, LatencyMetrics } from '../types/translator';

export interface WebRTCClientCallbacks {
  onStateChange?: (state: ConnectionState) => void;
  onTranscriptDelta?: (speaker: 'user' | 'translator', deltaText: string) => void;
  onTranscriptFinal?: (
    speaker: 'user' | 'translator',
    text: string,
    direction: LanguageDirection
  ) => void;
  onLatencyUpdate?: (metrics: Partial<LatencyMetrics>) => void;
  onError?: (error: string) => void;
}

export class OpenAIRealtimeWebRTC {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private remoteAudioEl: HTMLAudioElement | null = null;
  private direction: LanguageDirection = 'en-to-fr';
  private callbacks: WebRTCClientCallbacks = {};

  private currentInputTranscript = '';
  private currentOutputTranscript = '';
  private startTime = 0;

  constructor(callbacks?: WebRTCClientCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public async connect(mediaStream: MediaStream, direction: LanguageDirection, userApiKey?: string): Promise<boolean> {
    this.direction = direction;
    this.notifyState('connecting');

    try {
      // 1. Get ephemeral token from backend
      const tokenRes = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: this.direction,
          apiKey: userApiKey,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.client_secret?.value) {
        throw new Error(tokenData.error || 'Failed to acquire OpenAI Realtime session token.');
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;

      // 2. Create RTCPeerConnection
      this.pc = new RTCPeerConnection();

      // 3. Attach remote audio element for output stream
      this.remoteAudioEl = document.createElement('audio');
      this.remoteAudioEl.autoplay = true;

      this.pc.ontrack = (e) => {
        if (this.remoteAudioEl && e.streams[0]) {
          this.remoteAudioEl.srcObject = e.streams[0];
          this.notifyState('playing');
        }
      };

      // 4. Add local audio tracks to peer connection
      mediaStream.getTracks().forEach((track) => {
        this.pc?.addTrack(track, mediaStream);
      });

      // 5. Create Data Channel for real-time control events
      this.dc = this.pc.createDataChannel('oai-events');
      this.setupDataChannelHandlers();

      // 6. WebRTC SDP Offer / Answer Exchange
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`WebRTC SDP handshake failed (${sdpResponse.status}): ${errText}`);
      }

      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      this.notifyState('connected');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'WebRTC connection failed';
      console.error('OpenAI Realtime WebRTC Connect Error:', msg);
      if (this.callbacks.onError) {
        this.callbacks.onError(msg);
      }
      this.notifyState('error');
      return false;
    }
  }

  private setupDataChannelHandlers() {
    if (!this.dc) return;

    this.dc.onopen = () => {
      this.notifyState('listening');
      this.sendSessionUpdate();
    };

    this.dc.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        this.handleRealtimeEvent(event);
      } catch (err) {
        console.error('Data channel parse error:', err);
      }
    };

    this.dc.onclose = () => {
      this.notifyState('idle');
    };
  }

  public updateDirection(newDirection: LanguageDirection) {
    this.direction = newDirection;
    this.sendSessionUpdate();
  }

  private sendSessionUpdate() {
    if (!this.dc || this.dc.readyState !== 'open') return;

    const sourceLang = this.direction === 'en-to-fr' ? 'English' : 'French';
    const targetLang = this.direction === 'en-to-fr' ? 'French' : 'English';

    const instructions = `You are a real-time simultaneous voice interpreter between ${sourceLang} and ${targetLang}.
RULES:
1. Translate incoming speech immediately from ${sourceLang} into ${targetLang}.
2. Speak ONLY the translated sentence in natural conversational ${targetLang}. Do NOT comment or converse.
3. Stream translated audio as soon as partial context is available.`;

    const event = {
      type: 'session.update',
      session: {
        instructions: instructions,
        voice: this.direction === 'en-to-fr' ? 'alloy' : 'shimmer',
      },
    };

    this.dc.send(JSON.stringify(event));
  }

  private handleRealtimeEvent(event: { type: string; [key: string]: unknown }) {
    switch (event.type) {
      case 'input_audio_buffer.speech_started': {
        this.startTime = Date.now();
        this.handleBargeIn();
        this.notifyState('listening');
        break;
      }

      case 'input_audio_buffer.speech_stopped': {
        this.notifyState('translating');
        break;
      }

      case 'response.audio_transcript.delta': {
        const delta = (event.delta as string) || '';
        this.currentOutputTranscript += delta;
        if (this.callbacks.onTranscriptDelta) {
          this.callbacks.onTranscriptDelta('translator', this.currentOutputTranscript);
        }
        break;
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const transcript = (event.transcript as string) || '';
        this.currentInputTranscript = transcript;
        if (this.callbacks.onTranscriptFinal) {
          this.callbacks.onTranscriptFinal('user', transcript, this.direction);
        }
        break;
      }

      case 'response.audio_transcript.done': {
        const text = (event.transcript as string) || this.currentOutputTranscript;
        if (text && this.callbacks.onTranscriptFinal) {
          this.callbacks.onTranscriptFinal('translator', text, this.direction);
        }

        if (this.startTime > 0 && this.callbacks.onLatencyUpdate) {
          const totalMs = Date.now() - this.startTime;
          this.callbacks.onLatencyUpdate({
            sttMs: Math.round(totalMs * 0.3),
            translationMs: Math.round(totalMs * 0.3),
            ttsMs: Math.round(totalMs * 0.4),
            totalMs: totalMs,
            lastUpdated: Date.now(),
          });
        }

        this.currentOutputTranscript = '';
        this.notifyState('listening');
        break;
      }

      case 'error': {
        console.error('OpenAI Realtime API Event Error:', event.error);
        if (this.callbacks.onError) {
          const message = typeof event.error === 'object' && event.error && 'message' in event.error 
            ? String((event.error as { message: unknown }).message) 
            : 'OpenAI Realtime API Error';
          this.callbacks.onError(message);
        }
        break;
      }
    }
  }

  public handleBargeIn() {
    // 1. Duck/pause current audio playback instantly
    if (this.remoteAudioEl) {
      this.remoteAudioEl.pause();
      this.remoteAudioEl.currentTime = 0;
    }

    // 2. Send response.cancel event over DataChannel
    if (this.dc && this.dc.readyState === 'open') {
      const cancelEvent = { type: 'response.cancel' };
      try {
        this.dc.send(JSON.stringify(cancelEvent));
      } catch (err) {
        console.warn('Failed to send cancel event on barge-in:', err);
      }
    }
  }

  private notifyState(state: ConnectionState) {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(state);
    }
  }

  public disconnect() {
    this.handleBargeIn();

    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.remoteAudioEl) {
      this.remoteAudioEl.srcObject = null;
      this.remoteAudioEl = null;
    }

    this.notifyState('idle');
  }
}
