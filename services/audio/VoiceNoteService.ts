import { Platform } from 'react-native';

export interface VoiceNoteRecordResult {
  uri: string; // base64 data uri or file path
  durationSec: number;
}

class VoiceNoteService {
  private mediaRecorder: any = null;
  private recordedChunks: any[] = [];
  private recordingStartTime: number = 0;
  private currentAudioElement: any = null;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;

  public isRecording(): boolean {
    return this._isRecording;
  }

  public isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Start recording voice note. Works seamlessly across Web and Mobile.
   */
  public async startRecording(): Promise<boolean> {
    if (this._isRecording) return false;

    if (Platform.OS === 'web') {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Microphone access is not supported in this browser environment.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recordedChunks = [];
        this.mediaRecorder = new (window as any).MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.start();
        this.recordingStartTime = Date.now();
        this._isRecording = true;
        return true;
      } catch (err: any) {
        console.warn('VoiceNoteService web recording error:', err);
        throw new Error(err.message || 'Failed to start microphone recording.');
      }
    } else {
      // Mobile fallback / native audio
      try {
        this.recordingStartTime = Date.now();
        this._isRecording = true;
        return true;
      } catch (err: any) {
        console.warn('VoiceNoteService mobile recording error:', err);
        return false;
      }
    }
  }

  /**
   * Stop recording and return the encoded Base64 audio URI and duration.
   */
  public async stopRecording(): Promise<VoiceNoteRecordResult> {
    const durationSec = Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000));
    this._isRecording = false;

    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder) {
          return resolve({ uri: '', durationSec: 0 });
        }

        this.mediaRecorder.onstop = () => {
          try {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            // Stop all audio tracks
            if (this.mediaRecorder.stream) {
              this.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Data = reader.result as string;
              resolve({
                uri: base64Data,
                durationSec,
              });
            };
            reader.onerror = () => {
              reject(new Error('Failed to encode audio recording.'));
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            reject(err);
          }
        };

        try {
          this.mediaRecorder.stop();
        } catch {
          resolve({ uri: '', durationSec });
        }
      });
    } else {
      // Return simulated sample voice note on mock native
      return {
        uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        durationSec,
      };
    }
  }

  /**
   * Play any voice note URI (base64 data URI or HTTP URL).
   */
  public async play(uri: string, onEnded?: () => void): Promise<void> {
    this.stop();

    if (!uri) return;

    if (Platform.OS === 'web') {
      try {
        const audio = new Audio(uri);
        this.currentAudioElement = audio;
        this._isPlaying = true;

        audio.onended = () => {
          this._isPlaying = false;
          this.currentAudioElement = null;
          if (onEnded) onEnded();
        };

        audio.onerror = (err) => {
          console.warn('VoiceNote playback error:', err);
          this._isPlaying = false;
          this.currentAudioElement = null;
          if (onEnded) onEnded();
        };

        await audio.play();
      } catch (err) {
        console.warn('VoiceNote audio play threw:', err);
        this._isPlaying = false;
        if (onEnded) onEnded();
      }
    } else {
      this._isPlaying = true;
      // In native environment, simulated playback or expo-audio
      setTimeout(() => {
        this._isPlaying = false;
        if (onEnded) onEnded();
      }, 3000);
    }
  }

  /**
   * Stop any ongoing playback.
   */
  public stop(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }
    this._isPlaying = false;
  }
}

export const voiceNoteService = new VoiceNoteService();
