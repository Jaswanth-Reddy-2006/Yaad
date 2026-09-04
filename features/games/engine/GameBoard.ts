import { GameCardItem, GameDifficulty, GameType } from '../../../types';

export interface CardDefinition {
  symbolId: string;
  title: string;
  category: 'FRUIT' | 'ANIMAL' | 'NATURE' | 'OBJECT' | 'VEHICLE';
  iconName: string;
}

export const DEMENTIA_GAME_SYMBOLS: CardDefinition[] = [
  { symbolId: 'apple', title: 'Apple', category: 'FRUIT', iconName: 'Apple' },
  { symbolId: 'sun', title: 'Sun', category: 'NATURE', iconName: 'Sun' },
  { symbolId: 'flower', title: 'Flower', category: 'NATURE', iconName: 'Flower2' },
  { symbolId: 'heart', title: 'Heart', category: 'NATURE', iconName: 'Heart' },
  { symbolId: 'star', title: 'Star', category: 'NATURE', iconName: 'Star' },
  { symbolId: 'bell', title: 'Bell', category: 'OBJECT', iconName: 'Bell' },
  { symbolId: 'key', title: 'Key', category: 'OBJECT', iconName: 'Key' },
  { symbolId: 'home', title: 'Home', category: 'OBJECT', iconName: 'Home' },
  { symbolId: 'tree', title: 'Tree', category: 'NATURE', iconName: 'Trees' },
  { symbolId: 'clock', title: 'Clock', category: 'OBJECT', iconName: 'Clock' },
  { symbolId: 'umbrella', title: 'Umbrella', category: 'OBJECT', iconName: 'Umbrella' },
  { symbolId: 'water', title: 'Water', category: 'NATURE', iconName: 'Droplet' },
];

export const GAME_SYMBOLS = DEMENTIA_GAME_SYMBOLS;

export class GameBoard {
  public static generateBoard(
    gameType: GameType,
    difficulty: GameDifficulty,
    customRng?: () => number
  ): GameCardItem[] {
    let groupCount = 4;
    if (gameType === 'PAIR') {
      if (difficulty === 'EASY') groupCount = 4; // 4 pairs = 8 cards
      else if (difficulty === 'MEDIUM') groupCount = 6; // 6 pairs = 12 cards
      else if (difficulty === 'HARD') groupCount = 8; // 8 pairs = 16 cards
    } else {
      // TRIPLET
      if (difficulty === 'EASY') groupCount = 3; // 3 triplets = 9 cards
      else if (difficulty === 'MEDIUM') groupCount = 4; // 4 triplets = 12 cards
      else if (difficulty === 'HARD') groupCount = 6; // 6 triplets = 18 cards
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
