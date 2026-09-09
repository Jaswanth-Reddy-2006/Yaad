import {
  HybridCompanionEngine,
  HybridEngineOptions,
  askMitraCare as askMitraCareEngine,
} from './routing/HybridCompanionEngine';
import { LLMResponse, DEFAULT_UNKNOWN_RESPONSE, LLMSource } from './types';

/**
 * Unified single entry point for MitraCare conversational questions.
 *
 * @param question The user's input query.
 * @param options Optional configuration including patient context, conversation state, or provider overrides.
 * @returns LLMResponse containing structured answer and source ('local' | 'groq' | 'offline_unknown' | 'groq_error').
 */
export async function askMitraCare(
  question: string,
  options?: HybridEngineOptions
): Promise<LLMResponse> {
  return askMitraCareEngine(question, options);
}

export class MitraCareLLMService {
  public static async ask(
    question: string,
    options?: HybridEngineOptions
  ): Promise<LLMResponse> {
    return askMitraCareEngine(question, options);
  }
}

export { DEFAULT_UNKNOWN_RESPONSE };
export type { LLMResponse, LLMSource };
