import { describe, test, expect, jest } from '@jest/globals';
import { GameBoard } from '../features/games/engine/GameBoard';
import { HintEngine } from '../features/games/engine/HintEngine';
import { GameController } from '../features/games/engine/GameController';
import { GameCardItem } from '../types';

describe('Cognitive Game Engine Tests', () => {
  test('GameBoard generates correct number of cards for PAIR EASY mode (2 pairs = 4 cards)', () => {
    const cards = GameBoard.generateBoard('PAIR', 'EASY');
    expect(cards.length).toBe(4);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
      expect(c.groupId).toBe(c.symbolId);
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  test('GameBoard generates correct number of cards for PAIR MEDIUM mode (6 pairs = 12 cards)', () => {
    const cards = GameBoard.generateBoard('PAIR', 'MEDIUM');
    expect(cards.length).toBe(12);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  test('GameBoard generates correct number of cards for PAIR HARD mode (8 pairs = 16 cards)', () => {
    const cards = GameBoard.generateBoard('PAIR', 'HARD');
    expect(cards.length).toBe(16);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  test('GameBoard generates correct number of cards for TRIPLET EASY mode (3 triplets = 9 cards)', () => {
    const cards = GameBoard.generateBoard('TRIPLET', 'EASY');
    expect(cards.length).toBe(9);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(3);
    });
  });

  test('GameBoard generates correct number of cards for TRIPLET MEDIUM mode (4 triplets = 12 cards)', () => {
    const cards = GameBoard.generateBoard('TRIPLET', 'MEDIUM');
    expect(cards.length).toBe(12);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(3);
    });
  });

  test('GameBoard generates correct number of cards for TRIPLET HARD mode (6 triplets = 18 cards)', () => {
    const cards = GameBoard.generateBoard('TRIPLET', 'HARD');
    expect(cards.length).toBe(18);

    const symbolCounts: Record<string, number> = {};
    cards.forEach((c) => {
      symbolCounts[c.symbolId] = (symbolCounts[c.symbolId] || 0) + 1;
    });

    Object.values(symbolCounts).forEach((count) => {
      expect(count).toBe(3);
    });
  });

  test('GameBoard supports deterministic seeded shuffle for reproducible testing', () => {
    let mockSeedState = 0.5;
    const deterministicRng = () => {
      mockSeedState = (mockSeedState * 9301 + 49297) % 233280;
      return mockSeedState / 233280;
    };

    const cards1 = GameBoard.generateBoard('PAIR', 'EASY', deterministicRng);

    mockSeedState = 0.5;
    const cards2 = GameBoard.generateBoard('PAIR', 'EASY', deterministicRng);

    expect(cards1.map((c) => c.symbolId)).toEqual(cards2.map((c) => c.symbolId));
  });

  test('HintEngine calculates valid matching pair hint card IDs', () => {
    const mockCards: GameCardItem[] = [
      { id: 'c1', symbolId: 'sun', groupId: 'sun', title: 'Sun', iconName: 'Sun', isFlipped: false, isMatched: false },
      { id: 'c2', symbolId: 'flower', groupId: 'flower', title: 'Flower', iconName: 'Flower2', isFlipped: false, isMatched: false },
      { id: 'c3', symbolId: 'sun', groupId: 'sun', title: 'Sun', iconName: 'Sun', isFlipped: false, isMatched: false },
      { id: 'c4', symbolId: 'flower', groupId: 'flower', title: 'Flower', iconName: 'Flower2', isFlipped: false, isMatched: true },
    ];

    const hints = HintEngine.findValidHint(mockCards, 'PAIR');
    expect(hints).toEqual(['c1', 'c3']);
  });

  test('HintEngine calculates valid matching triplet hint card IDs', () => {
    const mockCards: GameCardItem[] = [
      { id: 'c1', symbolId: 'star', groupId: 'star', title: 'Star', iconName: 'Star', isFlipped: false, isMatched: false },
      { id: 'c2', symbolId: 'star', groupId: 'star', title: 'Star', iconName: 'Star', isFlipped: false, isMatched: false },
      { id: 'c3', symbolId: 'star', groupId: 'star', title: 'Star', iconName: 'Star', isFlipped: false, isMatched: false },
      { id: 'c4', symbolId: 'apple', groupId: 'apple', title: 'Apple', iconName: 'Apple', isFlipped: false, isMatched: false },
    ];

    const hints = HintEngine.findValidHint(mockCards, 'TRIPLET');
    expect(hints).toEqual(['c1', 'c2', 'c3']);
  });

  test('GameController state machine transitions and session abandonment', () => {
    let latestState = null as any;
    const controller = new GameController('PAIR', 'EASY', (state) => {
      latestState = state;
    });

    expect(controller.getState().status).toBe('IDLE');

    controller.start();
    expect(controller.getState().status).toBe('PLAYING');

    controller.abandon();
    expect(controller.getState().status).toBe('ABANDONED');
    controller.dispose();
  });
});
