/**
 * Types and interfaces for the Offline IndicTrans2 TranslationService.
 */

export type TranslationDirection = 'indic-en' | 'en-indic';

export interface TranslationOptions {
  maxLength?: number;
  timeoutMs?: number;
}

export interface TranslationMetrics {
  initMs: number;
  tokenizationMs: number;
  encoderMs: number;
  decoderMs: number;
  totalMs: number;
  tokensGenerated: number;
  stepTimesMs?: number[];
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  direction: TranslationDirection;
  metrics: TranslationMetrics;
}

export interface ModelPathConfig {
  indicEnModelDir: string;
  enIndicModelDir: string;
  indicEnVocabDir: string;
  enIndicVocabDir: string;
}

export interface GenerationConfig {
  decoderStartTokenId: number;
  eosTokenId: number;
  padTokenId: number;
  bosTokenId: number;
  maxLength: number;
  hiddenDim: number;
}
