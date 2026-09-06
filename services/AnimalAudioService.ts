import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { voiceService } from './VoiceService';

export interface AnimalSoundData {
  id: string;
  name: string;
  audioUrl: string;
  fallbackSpeech: string;
}

export const ANIMAL_AUDIO_MAP: Record<string, AnimalSoundData> = {
  dog: {
    id: 'dog',
    name: 'Dog',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/dog_barking.ogg',
    fallbackSpeech: 'Woof! Woof! Woof!',
  },
  cat: {
    id: 'cat',
    name: 'Cat',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/cat_purr_meow.ogg',
    fallbackSpeech: 'Meow! Meow! Meow!',
  },
  cow: {
    id: 'cow',
    name: 'Cow',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/cow_moo.ogg',
    fallbackSpeech: 'Mooo! Mooo!',
  },
  bird: {
    id: 'bird',
    name: 'Bird',
    audioUrl: 'https://actions.google.com/sounds/v1/birds/wood_thrush_song.ogg',
    fallbackSpeech: 'Chirp chirp! Tweet tweet!',
  },
  duck: {
    id: 'duck',
    name: 'Duck',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/duck_quack.ogg',
    fallbackSpeech: 'Quack! Quack! Quack!',
  },
  sheep: {
    id: 'sheep',
    name: 'Sheep',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/sheep_bleating.ogg',
    fallbackSpeech: 'Baa! Baa! Baa!',
  },
  lion: {
    id: 'lion',
    name: 'Lion',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/lion_roar.ogg',
    fallbackSpeech: 'Roar! Roar!',
  },
  elephant: {
    id: 'elephant',
    name: 'Elephant',
    audioUrl: 'https://actions.google.com/sounds/v1/animals/elephant_trumpeting.ogg',
    fallbackSpeech: 'Pawoo! Pawoo!',
  },
};

class AnimalAudioService {
  private activePlayer: AudioPlayer | null = null;
  private webAudio: HTMLAudioElement | null = null;

  /**
   * Play real animal audio sound effect with fallback to voice synthesis.
   */
  public async playAnimalSound(animalId: string): Promise<void> {
    const soundData = ANIMAL_AUDIO_MAP[animalId];
    if (!soundData) return;

    try {
      this.stop();

      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Audio' in window) {
        this.webAudio = new window.Audio(soundData.audioUrl);
        this.webAudio.volume = 1.0;
        await this.webAudio.play();
        return;
      }

      // Native playback using expo-audio in SDK 57
      this.activePlayer = createAudioPlayer({ uri: soundData.audioUrl });
      this.activePlayer.play();
    } catch {
      // Graceful fallback to vocal sound if network or codec fails
      voiceService.speak(soundData.fallbackSpeech);
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
