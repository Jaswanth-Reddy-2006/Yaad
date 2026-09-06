import { GameCardItem, GameDifficulty, GameType } from '../../../types';

export interface CardDefinition {
  symbolId: string;
  title: string;
  category: 'FRUIT' | 'OBJECT' | 'NATURE' | 'VEHICLE';
  iconName: string;
}

/**
 * 10 Highly recognizable, warm, familiar everyday objects designed for elderly & dementia cognitive exercises.
 */
export const DEMENTIA_GAME_SYMBOLS: CardDefinition[] = [
  { symbolId: 'apple', title: 'Apple', category: 'FRUIT', iconName: 'Apple' },
  { symbolId: 'banana', title: 'Banana', category: 'FRUIT', iconName: 'Banana' },
  { symbolId: 'mango', title: 'Mango', category: 'FRUIT', iconName: 'Mango' },
  { symbolId: 'flower', title: 'Flower', category: 'NATURE', iconName: 'Flower2' },
  { symbolId: 'cup', title: 'Cup', category: 'OBJECT', iconName: 'Coffee' },
  { symbolId: 'umbrella', title: 'Umbrella', category: 'OBJECT', iconName: 'Umbrella' },
  { symbolId: 'bicycle', title: 'Bicycle', category: 'VEHICLE', iconName: 'Car' },
  { symbolId: 'house', title: 'House', category: 'OBJECT', iconName: 'Home' },
  { symbolId: 'radio', title: 'Radio', category: 'OBJECT', iconName: 'Bell' },
  { symbolId: 'glasses', title: 'Glasses', category: 'OBJECT', iconName: 'Clock' },
];

export const GAME_SYMBOLS = DEMENTIA_GAME_SYMBOLS;

export class GameBoard {
  public static generateBoard(
    gameType: GameType,
    difficulty: GameDifficulty,
    customRng?: () => number
  ): GameCardItem[] {
    let groupCount = 2; // Default 2 pairs = 4 cards (2x2) for EASY
    if (gameType === 'PAIR') {
      if (difficulty === 'EASY') groupCount = 2;   // 2 pairs = 4 cards (2x2 grid)
      else if (difficulty === 'MEDIUM') groupCount = 6; // 6 pairs = 12 cards (3x4 grid)
      else if (difficulty === 'HARD') groupCount = 8;   // 8 pairs = 16 cards (4x4 grid)
    } else {
      // TRIPLET
      if (difficulty === 'EASY') groupCount = 3;   // 3 triplets = 9 cards (3x3 grid)
      else if (difficulty === 'MEDIUM') groupCount = 4; // 4 triplets = 12 cards (3x4 grid)
      else if (difficulty === 'HARD') groupCount = 6;   // 6 triplets = 18 cards (3x6 grid)
    }

    const selectedSymbols = DEMENTIA_GAME_SYMBOLS.slice(0, groupCount);
    const copiesPerGroup = gameType === 'PAIR' ? 2 : 3;

    const rawCards: CardDefinition[] = [];
    selectedSymbols.forEach((sym) => {
      for (let i = 0; i < copiesPerGroup; i++) {
        rawCards.push(sym);
      }
    });

    const rng = customRng || Math.random;
    const shuffled = this.fisherYatesShuffle(rawCards, rng);

    return shuffled.map((item, index) => ({
      id: `card-${index}-${item.symbolId}`,
      symbolId: item.symbolId,
      groupId: item.symbolId,
      title: item.title,
      iconName: item.iconName,
      isFlipped: false,
      isMatched: false,
      isHighlightedHint: false,
    }));
  }

  private static fisherYatesShuffle<T>(array: T[], rng: () => number): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
