import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { ANIMAL_AUDIO_BASE64 } from '../constants/AnimalAudioData';

export interface AnimalSoundData {
  id: string;
  name: string;
}

export const ANIMAL_LIST = [
  { id: 'dog', name: 'Dog' },
  { id: 'cat', name: 'Cat' },
  { id: 'cow', name: 'Cow' },
  { id: 'bird', name: 'Bird' },
  { id: 'duck', name: 'Duck' },
  { id: 'sheep', name: 'Sheep' },
  { id: 'lion', name: 'Lion' },
  { id: 'elephant', name: 'Elephant' },
];

class AnimalAudioService {
  private activePlayer: AudioPlayer | null = null;
  private webAudio: HTMLAudioElement | null = null;

  /**
   * Play genuine real acoustic animal sound effect.
   * Uses real audio waveform without any robotic human TTS fallback.
   */
  public async playAnimalSound(animalId: string): Promise<void> {
    const dataUri = ANIMAL_AUDIO_BASE64[animalId];
    if (!dataUri) {
      console.warn(`[AnimalAudioService] Sound not found for animal: ${animalId}`);
      return;
    }

    try {
      this.stop();

      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Audio' in window) {
        this.webAudio = new window.Audio(dataUri);
        this.webAudio.volume = 1.0;
        await this.webAudio.play();
        return;
      }

      // Native playback using expo-audio in SDK 57
      this.activePlayer = createAudioPlayer({ uri: dataUri });
      this.activePlayer.play();
    } catch (err) {
      console.warn('[AnimalAudioService] Audio playback notice:', err);
    }
  }

  public stop(): void {
    try {
      if (this.webAudio) {
        this.webAudio.pause();
        this.webAudio.currentTime = 0;
        this.webAudio = null;
      }
      if (this.activePlayer) {
        this.activePlayer.pause();
        this.activePlayer = null;
      }
    } catch {
      // Graceful cleanup
    }
  }
}

export const animalAudioService = new AnimalAudioService();
