import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export type VoiceIntent =
  | 'WHAT_TO_DO_NOW'
  | 'NEXT_REMINDER'
  | 'TODAY_PLAN'
  | 'HELP_SOS'
  | 'REPEAT'
  | 'UNKNOWN';

export interface VoiceIntentResult {
  intent: VoiceIntent;
  spokenText: string;
  responsePrompt: string;
}

export function parseVoiceIntent(query: string): VoiceIntentResult {
  const normalized = (query || '').toLowerCase().trim();

  if (
    normalized.includes('what should i do') ||
    normalized.includes('next activity') ||
    normalized.includes('play game') ||
    normalized.includes('start game') ||
    normalized.includes('game')
  ) {
    return {
      intent: 'WHAT_TO_DO_NOW',
      spokenText: query,
      responsePrompt: 'Opening your recommended memory activity now. Match the pictures at your own pace.',
    };
  }

  if (
    normalized.includes('reminder') ||
    normalized.includes('medicine') ||
    normalized.includes('water') ||
    normalized.includes('pill')
  ) {
    return {
      intent: 'NEXT_REMINDER',
      spokenText: query,
      responsePrompt: 'Your next reminder is Morning Medicine at 9:00 AM. Please take it with a glass of water.',
    };
  }

  if (
    normalized.includes('plan') ||
    normalized.includes('today') ||
    normalized.includes('schedule')
  ) {
    return {
      intent: 'TODAY_PLAN',
      spokenText: query,
      responsePrompt: 'Today you have morning medicine at 9:00 AM, a cognitive memory game at 10:00 AM, and hydration check at 2:00 PM.',
    };
  }

  if (
    normalized.includes('help') ||
    normalized.includes('sos') ||
    normalized.includes('emergency')
  ) {
    return {
      intent: 'HELP_SOS',
      spokenText: query,
      responsePrompt: 'Help request received. Opening emergency assistance and notifying your caregiver.',
    };
  }

  if (normalized.includes('repeat') || normalized.includes('say again')) {
    return {
      intent: 'REPEAT',
      spokenText: query,
      responsePrompt: 'Repeating your daily routine overview.',
    };
  }

  return {
    intent: 'UNKNOWN',
    spokenText: query,
    responsePrompt: 'I am listening. You can ask "What should I do now?", "Next reminder", or "Help me".',
  };
}

export class VoiceService {
  private isSpeakingFlag = false;

  public async speak(text: string): Promise<void> {
    if (!text || text.trim().length === 0) return;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
      }

      await this.stop();
      this.isSpeakingFlag = true;

      Speech.speak(text, {
        language: 'en-US',
        rate: 0.88, // Slightly slower rate for elderly clarity
        pitch: 1.0,
        onDone: () => {
          this.isSpeakingFlag = false;
        },
        onError: () => {
          this.isSpeakingFlag = false;
        },
      });
    } catch {
      this.isSpeakingFlag = false;
    }
  }

  public async processQueryAndSpeak(query: string): Promise<VoiceIntentResult> {
    const intentResult = parseVoiceIntent(query);
    await this.speak(intentResult.responsePrompt);
    return intentResult;
  }

  public async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
    } catch {
      // Graceful fallback
    } finally {
      this.isSpeakingFlag = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingFlag;
  }
}

export const voiceService = new VoiceService();
