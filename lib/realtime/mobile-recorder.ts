import { ConnectionState, LanguageDirection, LatencyMetrics } from '../types/translator';

export interface MobileRecorderCallbacks {
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

export class MobileUniversalRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private callbacks: MobileRecorderCallbacks = {};
  private direction: LanguageDirection = 'en-to-fr';
  private userApiKey?: string;
  private isRecording = false;

  private unlockAudioEl: HTMLAudioElement | null = null;

  constructor(callbacks?: MobileRecorderCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  // Call on user tap/touch event to unlock iOS Safari audio restrictions
  public unlockMobileAudio() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.unlockAudioEl) {
        this.unlockAudioEl = new Audio();
      }
      // Silent 1-pixel WAV audio to unlock iOS Safari HTMLAudioElement autoplay policy
      this.unlockAudioEl.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.unlockAudioEl.play().catch(() => {});
    } catch (e) {
      console.warn('Audio unlock notice:', e);
    }
  }

  public async startRecording(direction: LanguageDirection, userApiKey?: string): Promise<boolean> {
    this.direction = direction;
    this.userApiKey = userApiKey;
    this.audioChunks = [];
    this.unlockMobileAudio();

    try {
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      // Determine best supported MIME type on mobile device
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
        this.notifyState('listening');
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mobile microphone access error';
      console.error('Mobile mic capture error:', msg);
      if (this.callbacks.onError) {
        this.callbacks.onError('Microphone access blocked. Please allow microphone permissions in browser settings.');
      }
      this.notifyState('error');
      return false;
    }
  }

  public async stopRecordingAndTranslate(): Promise<void> {
    if (!this.mediaRecorder || !this.isRecording) return;

    const startTime = Date.now();
    this.isRecording = false;
    this.notifyState('translating');

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.notifyState('idle');
        resolve();
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          this.audioChunks = [];

          const formData = new FormData();
          formData.append('audio', audioBlob, 'speech.webm');
          formData.append('direction', this.direction);
          if (this.userApiKey) {
            formData.append('apiKey', this.userApiKey);
          }

          const res = await fetch('/api/mobile/translate', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const original = data.originalText || '';
            const translated = data.translatedText || '';

            if (original && this.callbacks.onTranscriptFinal) {
              this.callbacks.onTranscriptFinal('user', original, this.direction);
            }

            if (translated && this.callbacks.onTranscriptFinal) {
              this.callbacks.onTranscriptFinal('translator', translated, this.direction);
            }

            // Play mobile translated MP3 audio out loud
            if (data.audioBase64) {
              this.notifyState('playing');
              const audio = new Audio(data.audioBase64);
              audio.onended = () => {
                this.notifyState('idle');
              };
              await audio.play();
            } else {
              this.notifyState('idle');
            }

            const tEnd = Date.now();
            if (this.callbacks.onLatencyUpdate) {
              this.callbacks.onLatencyUpdate({
                totalMs: tEnd - startTime,
                lastUpdated: Date.now(),
              });
            }
          } else {
            this.notifyState('idle');
          }
        } catch (e) {
          console.error('Mobile translation request failed:', e);
          this.notifyState('idle');
        }
        resolve();
      };

      this.mediaRecorder.stop();
    });
  }

  private notifyState(state: ConnectionState) {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(state);
    }
  }

  public cancel() {
    this.isRecording = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('MediaRecorder stop error:', e);
      }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.notifyState('idle');
  }
}
