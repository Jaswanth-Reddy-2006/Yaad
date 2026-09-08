import { GameCardItem, GameDifficulty, GameResult, GameStatus, GameType } from '../../../types';
import { GameBoard } from './GameBoard';
import { GameTimer } from './GameTimer';
import { HintEngine } from './HintEngine';
import { gameRepository } from '../../../repositories/GameRepository';
import { voiceService } from '../../../services/VoiceService';
import { voiceContentResolver } from '../../../services/voice/VoiceContentResolver';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

export interface GameState {
  cards: GameCardItem[];
  gameType: GameType;
  difficulty: GameDifficulty;
  status: GameStatus;
  selectedCardIds: string[];
  isLocked: boolean; // lock out rapid taps during evaluation and feedback
  attempts: number;
  mistakes: number;
  matchesCount: number;
  totalRequiredMatches: number;
  hintsUsed: number;
  hintCooldownActive: boolean;
  elapsedSeconds: number;
  score: number;
  accuracy: number;
  startedAt: string;
  result?: GameResult;
}

export class GameController {
  private state: GameState;
  private timer: GameTimer;
  private onStateChange: (state: GameState) => void;
  private sessionId: string;
  private evaluationTimeout: any = null;
  private hintCooldownTimeout: any = null;

  constructor(
    gameType: GameType,
    difficulty: GameDifficulty,
    onStateChange: (state: GameState) => void,
    customRng?: () => number
  ) {
    this.onStateChange = onStateChange;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const cards = GameBoard.generateBoard(gameType, difficulty, customRng);
    const multiplier = gameType === 'PAIR' ? 2 : 3;

    this.timer = new GameTimer((seconds) => {
      this.state.elapsedSeconds = seconds;
      this.notify();
    });

    this.state = {
      cards,
      gameType,
      difficulty,
      status: 'IDLE',
      selectedCardIds: [],
      isLocked: false,
      attempts: 0,
      mistakes: 0,
      matchesCount: 0,
      totalRequiredMatches: cards.length / multiplier,
      hintsUsed: 0,
      hintCooldownActive: false,
      elapsedSeconds: 0,
      score: 0,
      accuracy: 100,
      startedAt: new Date().toISOString(),
    };
  }

  private getCurrentLanguage(): string {
    return useAccessibilityStore.getState().currentLanguage || 'en';
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public start(): void {
    if (this.state.status === 'PLAYING') return;
    this.state.status = 'PLAYING';
    this.timer.start();
    this.notify();

    const lang = this.getCurrentLanguage();
    const category = this.state.gameType === 'PAIR' ? 'PAIR_INSTRUCTION' : 'TRIPLET_INSTRUCTION';
    const { key, text } = voiceContentResolver.getRandomPhrase(category, lang);
    voiceService.speak(text, lang, undefined, 'NORMAL', key);
  }

  public async selectCard(cardId: string): Promise<void> {
    if (
      this.state.status !== 'PLAYING' ||
      this.state.isLocked ||
      this.state.selectedCardIds.includes(cardId)
    ) {
      return;
    }

    const cardIndex = this.state.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1 || this.state.cards[cardIndex].isMatched) {
      return;
    }

    // Clear previous hint highlights
    this.state.cards = this.state.cards.map((c) => ({ ...c, isHighlightedHint: false }));

    // Reveal card
    this.state.cards[cardIndex].isFlipped = true;
    this.state.selectedCardIds.push(cardId);
    this.notify();

    const maxSelection = this.state.gameType === 'PAIR' ? 2 : 3;

    if (this.state.selectedCardIds.length === maxSelection) {
      await this.evaluateSelection();
    }
  }

  private async evaluateSelection(): Promise<void> {
    this.state.status = 'EVALUATING';
    this.state.isLocked = true;
    this.state.attempts++;
    this.notify();

    const selectedCards = this.state.cards.filter((c) =>
      this.state.selectedCardIds.includes(c.id)
    );

    const firstSymbol = selectedCards[0].symbolId;
    const isMatch = selectedCards.every((c) => c.symbolId === firstSymbol);
    const lang = this.getCurrentLanguage();

    if (isMatch) {
      this.state.matchesCount++;
      this.state.cards = this.state.cards.map((c) =>
        this.state.selectedCardIds.includes(c.id) ? { ...c, isMatched: true } : c
      );
      this.state.selectedCardIds = [];
      this.state.isLocked = false;

      const { key, text } = voiceContentResolver.getRandomPhrase('MATCH_PRAISE', lang);
      voiceService.speak(text, lang, undefined, 'HIGH', key);

      if (this.state.matchesCount >= this.state.totalRequiredMatches) {
        await this.handleCompletion();
      } else {
        this.state.status = 'PLAYING';
        this.notify();
      }
    } else {
      this.state.status = 'FEEDBACK';
      this.state.mistakes++;

      const { key, text } = voiceContentResolver.getRandomPhrase('MISMATCH_GENTLE', lang);
      voiceService.speak(text, lang, undefined, 'NORMAL', key);

      if (this.evaluationTimeout) clearTimeout(this.evaluationTimeout);
      this.evaluationTimeout = setTimeout(() => {
        if (this.state.status === 'FEEDBACK') {
          this.state.cards = this.state.cards.map((c) =>
            this.state.selectedCardIds.includes(c.id) ? { ...c, isFlipped: false } : c
          );
          this.state.selectedCardIds = [];
          this.state.isLocked = false;
          this.state.status = 'PLAYING';
          this.notify();
        }
      }, 1200);
    }
  }

  public useHint(): void {
    if (
      this.state.status !== 'PLAYING' ||
      this.state.isLocked ||
      this.state.hintCooldownActive ||
      this.state.hintsUsed >= 3
    ) {
      return;
    }

    const hintCardIds = HintEngine.findValidHint(this.state.cards, this.state.gameType);
    if (hintCardIds.length === 0) return;

    this.state.hintsUsed++;
    this.state.hintCooldownActive = true;
    this.state.cards = this.state.cards.map((c) =>
      hintCardIds.includes(c.id) ? { ...c, isHighlightedHint: true } : c
    );
    this.notify();

    const lang = this.getCurrentLanguage();
    const category = this.state.gameType === 'PAIR' ? 'HINT_PAIR' : 'HINT_TRIPLET';
    const { key, text } = voiceContentResolver.getRandomPhrase(category, lang);
    voiceService.speak(text, lang, undefined, 'HIGH', key);

    if (this.hintCooldownTimeout) clearTimeout(this.hintCooldownTimeout);
    this.hintCooldownTimeout = setTimeout(() => {
      this.state.hintCooldownActive = false;
      this.notify();
    }, 3000);
  }

  private async handleCompletion(): Promise<void> {
    this.timer.pause();
    this.state.status = 'COMPLETED';

    const completedAt = new Date().toISOString();
    const duration = Math.max(this.state.elapsedSeconds, 1);
    const accuracy = Math.round(
      (this.state.totalRequiredMatches / Math.max(this.state.attempts, 1)) * 100
    );

    const baseScore = 1000;
    const penaltyPerMistake = 50;
    const penaltyPerHint = 30;
    const score = Math.max(
      100,
      baseScore - this.state.mistakes * penaltyPerMistake - this.state.hintsUsed * penaltyPerHint
    );

    this.state.score = score;
    this.state.accuracy = accuracy;

    const savedResult = await gameRepository.saveResult({
      sessionId: this.sessionId,
      gameId: this.state.gameType,
      difficulty: this.state.difficulty,
      score,
      accuracy,
      durationSeconds: duration,
      attempts: this.state.attempts,
      mistakes: this.state.mistakes,
      hintsUsed: this.state.hintsUsed,
      startedAt: this.state.startedAt,
      completedAt,
      status: 'COMPLETED',
    });

    this.state.result = savedResult;
    this.notify();

    const lang = this.getCurrentLanguage();
    const category = this.state.gameType === 'PAIR' ? 'COMPLETION_PAIR' : 'COMPLETION_TRIPLET';
    const { key, text } = voiceContentResolver.getRandomPhrase(category, lang);
    voiceService.speak(text, lang, undefined, 'HIGH', key);
  }

  public abandon(): void {
    if (this.state.status === 'COMPLETED' || this.state.status === 'ABANDONED') return;
    this.clearTimeouts();
    this.timer.pause();
    this.state.status = 'ABANDONED';
    this.notify();
  }

  public restart(): void {
    this.clearTimeouts();
    this.timer.dispose();
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const cards = GameBoard.generateBoard(this.state.gameType, this.state.difficulty);
    const multiplier = this.state.gameType === 'PAIR' ? 2 : 3;

    this.timer = new GameTimer((seconds) => {
      this.state.elapsedSeconds = seconds;
      this.notify();
    });

    this.state = {
      cards,
      gameType: this.state.gameType,
      difficulty: this.state.difficulty,
      status: 'IDLE',
      selectedCardIds: [],
      isLocked: false,
      attempts: 0,
      mistakes: 0,
      matchesCount: 0,
      totalRequiredMatches: cards.length / multiplier,
      hintsUsed: 0,
      hintCooldownActive: false,
      elapsedSeconds: 0,
      score: 0,
      accuracy: 100,
      startedAt: new Date().toISOString(),
    };

    this.start();
  }

  public pause(): void {
    if (this.state.status === 'PLAYING') {
      this.state.status = 'PAUSED';
      this.timer.pause();
      this.notify();
    }
  }

  public resume(): void {
    if (this.state.status === 'PAUSED') {
      this.state.status = 'PLAYING';
      this.timer.resume();
      this.notify();
    }
  }

  public dispose(): void {
    this.clearTimeouts();
    this.timer.dispose();
  }

  private clearTimeouts(): void {
    if (this.evaluationTimeout) {
      clearTimeout(this.evaluationTimeout);
      this.evaluationTimeout = null;
    }
    if (this.hintCooldownTimeout) {
      clearTimeout(this.hintCooldownTimeout);
      this.hintCooldownTimeout = null;
    }
  }

  private notify(): void {
    this.onStateChange({ ...this.state, cards: [...this.state.cards] });
  }
}
