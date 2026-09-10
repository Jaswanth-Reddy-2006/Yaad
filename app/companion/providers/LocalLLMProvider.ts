import { GroqCompanionProvider, GroqProviderConfig } from './GroqCompanionProvider';

/**
 * LocalLLMProvider is an alias / extension of the LLM fallback provider (Groq).
 */
export class LocalLLMProvider extends GroqCompanionProvider {
  constructor(config?: GroqProviderConfig) {
    super(config);
  }
}

export * from './GroqCompanionProvider';
