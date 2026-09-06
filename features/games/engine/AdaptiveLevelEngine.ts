import { GameDifficulty, GameResult } from '../../../types';

export class AdaptiveLevelEngine {
  /**
   * Analyzes current session performance and calculates the next game level silently.
   * NO level text or numbers are exposed to the patient.
   */
  public static calculateNextDifficulty(
    currentDifficulty: GameDifficulty,
    result: Partial<GameResult>
  ): GameDifficulty {
    const accuracy = result.accuracy ?? 100;
    const mistakes = result.mistakes ?? 0;
    const timeTaken = result.durationSeconds ?? 20;

    // High performance criteria: High accuracy (>= 80%) & low mistakes (<= 2)
    const isHighPerformance = accuracy >= 80 && mistakes <= 2;
    // Low performance criteria: Low accuracy (< 60%) or high mistakes (>= 5)
    const needsPractice = accuracy < 60 || mistakes >= 5;

    if (currentDifficulty === 'EASY') {
      if (isHighPerformance) return 'MEDIUM';
      return 'EASY';
    }

    if (currentDifficulty === 'MEDIUM') {
      if (isHighPerformance && timeTaken < 30) return 'HARD';
      if (needsPractice) return 'EASY';
      return 'MEDIUM';
    }

    if (currentDifficulty === 'HARD') {
      if (isHighPerformance && timeTaken < 40) return 'EXPERT';
      if (needsPractice) return 'MEDIUM';
      return 'HARD';
    }

    if (currentDifficulty === 'EXPERT') {
      if (needsPractice) return 'HARD';
      return 'EXPERT';
    }

    return 'EASY';
  }
}
