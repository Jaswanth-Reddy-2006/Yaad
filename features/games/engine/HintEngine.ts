import { GameCardItem, GameType } from '../../../types';

export class HintEngine {
  public static findValidHint(cards: GameCardItem[], gameType: GameType): string[] {
    const unmatched = cards.filter((c) => !c.isMatched);
    const multiplier = gameType === 'PAIR' ? 2 : 3;

    // Group unmatched cards by symbolId
    const groups: Record<string, GameCardItem[]> = {};
    for (const card of unmatched) {
      if (!groups[card.symbolId]) {
        groups[card.symbolId] = [];
      }
      groups[card.symbolId].push(card);
    }

    // Find first symbol group that has required number of unmatched cards
    for (const symbolId in groups) {
      if (groups[symbolId].length >= multiplier) {
        return groups[symbolId].slice(0, multiplier).map((c) => c.id);
      }
    }

    return [];
  }
}
