import { Platform } from 'react-native';
import { voiceNoteService } from './VoiceNoteService';
import { voiceService } from '../VoiceService';

export type GentleToneType = 'CHIME' | 'HARP' | 'ZEN_BELL';

class GentleAlarmService {
  private isAlarmPlaying: boolean = false;
  private loopTimer: any = null;
  private audioCtx: any = null;

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Play the gentle alarm.
   * If `voiceNoteUrl` is provided, plays the caregiver's recorded voice note.
   * If NOT provided, synthesizes a soothing harmonic chime and speaks a calm reassurance phrase.
   */
  public async startGentleAlarm(params: {
    voiceNoteUrl?: string;
    tone?: GentleToneType;
    reminderTitle: string;
    patientName?: string;
    language?: string;
    onStatusChange?: (isPlaying: boolean) => void;
  }): Promise<void> {
    this.stopAlarm();
    this.isAlarmPlaying = true;
    if (params.onStatusChange) params.onStatusChange(true);

    const runAlarmCycle = async () => {
      if (!this.isAlarmPlaying) return;

      if (params.voiceNoteUrl) {
        // Play Caregiver's Recorded Voice Note
        await voiceNoteService.play(params.voiceNoteUrl, () => {
          if (this.isAlarmPlaying) {
            // Repeat after 6 seconds of calm silence
            this.loopTimer = setTimeout(runAlarmCycle, 6000);
          }
        });
      } else {
        // No voice recording: Play dementia-friendly soothing acoustic chime
        this.playSynthesizedChime(params.tone || 'CHIME');

        // Spoken gentle voice reassurance after 1.5s
        setTimeout(() => {
          if (!this.isAlarmPlaying) return;
          const greeting = params.patientName ? `${params.patientName}, ` : '';
          const speech = params.language === 'te'
            ? `${greeting}ఇది మీ ${params.reminderTitle} కొరకు సున్నితమైన రిమైండర్.`
            : params.language === 'hi'
            ? `${greeting}यह आपकी ${params.reminderTitle} का समय है।`
            : `${greeting}gentle reminder for your ${params.reminderTitle}. Take your time.`;

          voiceService.speak(speech, params.language, undefined, 'NORMAL', 'REMINDER_ALARM');

          if (this.isAlarmPlaying) {
            // Repeat cycle after 8 seconds
            this.loopTimer = setTimeout(runAlarmCycle, 8000);
          }
        }, 1800);
      }
    };

    runAlarmCycle();
  }

  /**
   * Synthesize a soothing multi-harmonic chime using Web Audio API.
   * Pentatonic scales and smooth sinusoidal decays eliminate jarring alarms.
   */
  public playSynthesizedChime(tone: GentleToneType = 'CHIME'): void {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    try {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }

      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Frequencies for soothing pentatonic chords
      const notes = tone === 'HARP'
        ? [440.00, 554.37, 659.25, 830.61] // A4, C#5, E5, G#5 (Maj7 calm harp)
        : tone === 'ZEN_BELL'
        ? [392.00, 587.33, 783.99] // G4, D5, G5 (Deep bell resonance)
        : [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright warm chime)

      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = tone === 'ZEN_BELL' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack to prevent clicks
        const startTime = now + index * 0.22;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.12);
        // Long exponential decay for meditative ring
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.5);
      });
    } catch (err) {
      console.warn('Gentle chime synthesis error:', err);
    }
  }

  /**
   * Immediately stops any playing alarm, chime, voice notes, and looping cycles.
   */
  public stopAlarm(): void {
    this.isAlarmPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    voiceNoteService.stop();
    voiceService.stopSpeaking();
  }
}

export const gentleAlarmService = new GentleAlarmService();
