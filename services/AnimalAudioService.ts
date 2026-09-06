import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

/**
 * Maps each animal ID to its local bundled .wav asset.
 * Metro bundler resolves require() statically at build time,
 * so these are bundled into the app as real audio files.
 */
const ANIMAL_SOUND_ASSETS: Record<string, ReturnType<typeof require>> = {
  dog: require('../assets/audio/animals/dog.wav'),
  cat: require('../assets/audio/animals/cat.wav'),
  cow: require('../assets/audio/animals/cow.wav'),
  chicken: require('../assets/audio/animals/chicken.wav'),
  goat: require('../assets/audio/animals/goat.wav'),
  horse: require('../assets/audio/animals/horse.wav'),
  elephant: require('../assets/audio/animals/elephant.wav'),
  lion: require('../assets/audio/animals/lion.wav'),
  frog: require('../assets/audio/animals/frog.wav'),
  bird: require('../assets/audio/animals/bird.wav'),
};

export interface AnimalSoundData {
  id: string;
  name: string;
}

export const ANIMAL_LIST = [
  { id: 'dog', name: 'Dog' },
  { id: 'cat', name: 'Cat' },
  { id: 'cow', name: 'Cow' },
  { id: 'chicken', name: 'Chicken' },
  { id: 'goat', name: 'Goat' },
  { id: 'horse', name: 'Horse' },
  { id: 'elephant', name: 'Elephant' },
  { id: 'lion', name: 'Lion' },
  { id: 'frog', name: 'Frog' },
  { id: 'bird', name: 'Bird' },
];

class AnimalAudioService {
  private activePlayer: AudioPlayer | null = null;

  /**
   * Play a genuine real animal sound from the bundled local .wav asset.
   * Uses expo-audio's createAudioPlayer with a static require() asset —
   * no base64 encoding, no synthetic TTS, pure real audio.
   */
  public async playAnimalSound(animalId: string): Promise<void> {
    const asset = ANIMAL_SOUND_ASSETS[animalId];
    if (!asset) {
      console.warn(`[AnimalAudioService] No audio asset found for animal: ${animalId}`);
      return;
    }

    try {
      this.stop();

      // expo-audio createAudioPlayer accepts a require() asset directly
      this.activePlayer = createAudioPlayer(asset);
      this.activePlayer.play();
    } catch (err) {
      console.warn('[AnimalAudioService] Audio playback error:', err);
    }
  }

  public stop(): void {
    try {
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
