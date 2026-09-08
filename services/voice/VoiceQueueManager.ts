import { VoiceQueueItem, VoicePriority, VoiceTTSCallbacks } from '../../types/voice';
import { ttsManager } from '../tts/TTSManager';

const PRIORITY_SCORES: Record<VoicePriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

export class VoiceQueueManager {
  private queue: VoiceQueueItem[] = [];
  private currentItem: VoiceQueueItem | null = null;
  private isProcessing = false;
  private isPaused = false;

  // Duplicate speech suppression & debouncing tracking
  private lastSpokenContentId: string | null = null;
  private lastSpokenText: string | null = null;
  private lastSpokenTimestamp = 0;
  private MIN_DUPLICATE_DEBOUNCE_MS = 2000;

  /**
   * Enqueues a voice speech item into the priority queue.
   */
  public async enqueue(
    text: string,
    languageIdentifier = 'en-IN',
    priority: VoicePriority = 'NORMAL',
    contentId?: string,
    callbacks?: VoiceTTSCallbacks
  ): Promise<void> {
    const now = Date.now();
    const targetContentId = contentId || text;

    // Suppress duplicate speech within debounce window for same screen/re-render
    if (
      (this.lastSpokenContentId === targetContentId || this.lastSpokenText === text) &&
      now - this.lastSpokenTimestamp < this.MIN_DUPLICATE_DEBOUNCE_MS &&
      priority !== 'CRITICAL'
    ) {
      console.log(`[VoiceQueueManager] Suppressed duplicate speech: "${text}"`);
      callbacks?.onDone?.();
      return;
    }

    const newItem: VoiceQueueItem = {
      id: `vq-${now}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      languageIdentifier,
      priority,
      contentId: targetContentId,
      callbacks,
      createdAt: now,
    };

    const newScore = PRIORITY_SCORES[priority];

    // If current speaking item has LOWER priority than newly arrived item (e.g. CRITICAL or HIGH arrives), interrupt it!
    if (this.currentItem) {
      const currentScore = PRIORITY_SCORES[this.currentItem.priority];
      if (newScore > currentScore) {
        console.log(
          `[VoiceQueueManager] Interrupting ${this.currentItem.priority} speech with higher priority ${priority}: "${text}"`
        );
        // Clear obsolete lower priority items from queue
        this.queue = this.queue.filter(
          (item) => PRIORITY_SCORES[item.priority] >= newScore
        );
        await this.stopCurrentSpeech();
      }
    }

    // Insert item in queue sorted by priority descending
    this.queue.push(newItem);
    this.queue.sort((a, b) => PRIORITY_SCORES[b.priority] - PRIORITY_SCORES[a.priority]);

    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.isPaused || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift();

    if (!item) {
      this.isProcessing = false;
      return;
    }

    this.currentItem = item;
    this.lastSpokenContentId = item.contentId || item.text;
    this.lastSpokenText = item.text;
    this.lastSpokenTimestamp = Date.now();

    try {
      await ttsManager.speak(item.text, item.languageIdentifier, {
        onStart: () => {
          item.callbacks?.onStart?.();
        },
        onDone: () => {
          this.currentItem = null;
          this.isProcessing = false;
          item.callbacks?.onDone?.();
          this.processNext();
        },
        onError: (err) => {
          console.warn(`[VoiceQueueManager] Speech error for item ${item.id}:`, err);
          this.currentItem = null;
          this.isProcessing = false;
          item.callbacks?.onError?.(err);
          this.processNext();
        },
      });
    } catch (err) {
      console.warn('[VoiceQueueManager] Execution exception in ttsManager.speak:', err);
      this.currentItem = null;
      this.isProcessing = false;
      item.callbacks?.onError?.(String(err));
      this.processNext();
    }
  }

  private async stopCurrentSpeech(): Promise<void> {
    const active = this.currentItem;
    this.currentItem = null;
    this.isProcessing = false;
    await ttsManager.stop();
    if (active) {
      active.callbacks?.onDone?.();
    }
  }

  /**
   * Stop speech immediately and clear low/normal queued items.
   */
  public async stop(clearQueue = true): Promise<void> {
    if (clearQueue) {
      this.queue = [];
    }
    await this.stopCurrentSpeech();
  }

  /**
   * Clears all queued items without stopping current speech.
   */
  public clearQueue(): void {
    this.queue = [];
  }

  public isSpeaking(): boolean {
    return this.currentItem !== null || ttsManager.isSpeaking();
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.processNext();
  }
}

export const voiceQueueManager = new VoiceQueueManager();
