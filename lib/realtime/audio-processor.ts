export interface AudioProcessorCallbacks {
  onVolumeChange?: (volume: number) => void;
  onSpeechStarted?: () => void;
  onSpeechEnded?: () => void;
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking = false;
  private speechSilenceTimer: NodeJS.Timeout | null = null;

  private callbacks: AudioProcessorCallbacks = {};

  constructor(callbacks?: AudioProcessorCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public async startCapture(): Promise<MediaStream> {
    if (this.mediaStream) {
      return this.mediaStream;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
        },
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 24000 });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      this.startVolumeMonitoring();

      return this.mediaStream;
    } catch (error) {
      console.error('Failed to capture audio stream:', error);
      throw error;
    }
  }

  private startVolumeMonitoring() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedVolume = Math.min(1, average / 128);

      if (this.callbacks.onVolumeChange) {
        this.callbacks.onVolumeChange(normalizedVolume);
      }

      // Simple VAD threshold
      const speechThreshold = 0.15;
      if (normalizedVolume > speechThreshold) {
        if (!this.isSpeaking) {
          this.isSpeaking = true;
          if (this.callbacks.onSpeechStarted) {
            this.callbacks.onSpeechStarted();
          }
        }
        if (this.speechSilenceTimer) {
          clearTimeout(this.speechSilenceTimer);
          this.speechSilenceTimer = null;
        }
      } else if (this.isSpeaking && !this.speechSilenceTimer) {
        this.speechSilenceTimer = setTimeout(() => {
          this.isSpeaking = false;
          if (this.callbacks.onSpeechEnded) {
            this.callbacks.onSpeechEnded();
          }
          this.speechSilenceTimer = null;
        }, 600);
      }

      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stopCapture() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.speechSilenceTimer) {
      clearTimeout(this.speechSilenceTimer);
      this.speechSilenceTimer = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.isSpeaking = false;
  }
}
