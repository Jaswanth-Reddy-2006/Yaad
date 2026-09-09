import {
  CompanionResult,
  ConversationState,
  PatientContext,
  LLMResponse,
  LLMSource,
  DEFAULT_UNKNOWN_RESPONSE,
  LocalSystemResult,
} from '../types';
import { OfflineCompanionEngine } from '../OfflineCompanionEngine';
import { PatientContextProvider } from '../PatientContextProvider';
import { GroqCompanionProvider, GroqProviderConfig } from '../providers/GroqCompanionProvider';
import { updateConversationState } from '../context';
import { checkInternetConnection, ConnectivityOptions } from '../network/connectivity';

export interface HybridEngineOptions {
  context?: PatientContext;
  conversationState?: ConversationState;
  useDatabaseContext?: boolean;
  connectivityOptions?: ConnectivityOptions;
  groqConfig?: GroqProviderConfig;
  groqProvider?: GroqCompanionProvider;
  enableGroqFallback?: boolean;
}

export class HybridCompanionEngine {
  private static defaultGroqProvider: GroqCompanionProvider = new GroqCompanionProvider();

  /**
   * Configure the global Groq provider instance.
   */
  public static configureGroq(config: GroqProviderConfig): void {
    this.defaultGroqProvider = new GroqCompanionProvider(config);
  }

  /**
   * Gets the active Groq provider.
   */
  public static getGroqProvider(): GroqCompanionProvider {
    return this.defaultGroqProvider;
  }

  /**
   * Evaluates the query using the local/offline companion knowledge system.
   */
  public static evaluateLocal(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState
  ): LocalSystemResult {
    const offlineResult = OfflineCompanionEngine.process(rawQuery, context, conversationState);
    const isKnown =
      offlineResult.intent !== 'UNKNOWN' &&
      offlineResult.outcomeType !== 'UNKNOWN_INTENT';

    return {
      known: isKnown,
      answer: isKnown ? offlineResult.response : null,
      companionResult: offlineResult,
    };
  }

  /**
   * Unified Single Entry Point: askMitraCare
   *
   * Flow:
   * 1. Try existing local/offline system.
   * 2. If known reliably -> return { answer, source: 'local' }.
   * 3. If unknown -> check lightweight internet connectivity.
   * 4. If offline -> return { answer: DEFAULT_UNKNOWN_RESPONSE, source: 'offline_unknown' }.
   * 5. If online -> Call Groq API.
   *    - On success: return { answer: groqAnswer, source: 'groq' }.
   *    - On error / timeout / fail: return { answer: DEFAULT_UNKNOWN_RESPONSE, source: 'groq_error' }.
   */
  public static async askMitraCare(
    rawQuery: string,
    options?: HybridEngineOptions
  ): Promise<LLMResponse> {
    let context: PatientContext = options?.context || {};
    if (options?.useDatabaseContext && (!options.context || Object.keys(options.context).length === 0)) {
      try {
        context = await PatientContextProvider.getPatientContext();
      } catch {
        context = {};
      }
    }

    const conversationState = options?.conversationState;

    // Step 1: Query local/offline system
    const localEval = this.evaluateLocal(rawQuery, context, conversationState);
    const localResult = localEval.companionResult!;

    if (localEval.known && localEval.answer) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.log('LLM source: local');
      }
      return {
        answer: localEval.answer,
        source: 'local',
        intent: localResult.intent,
        confidence: localResult.confidence,
        confidenceLevel: localResult.confidenceLevel,
        questionType: localResult.questionType,
        topic: localResult.topic,
        category: localResult.category,
        strategy: localResult.strategy,
        outcomeType: localResult.outcomeType,
        subIntents: localResult.subIntents,
        entities: localResult.entities,
        conversationState: localResult.conversationState,
      };
    }

    // Step 2: Local system does NOT know the answer -> Check internet connectivity
    const isOnline = await checkInternetConnection(options?.connectivityOptions);

    if (!isOnline) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.log('LLM source: offline_unknown');
      }
      return {
        answer: DEFAULT_UNKNOWN_RESPONSE,
        source: 'offline_unknown',
        intent: 'UNKNOWN',
        confidence: localResult.confidence,
        confidenceLevel: localResult.confidenceLevel,
        questionType: localResult.questionType,
        topic: localResult.topic,
        category: localResult.category,
        strategy: 'UNKNOWN',
        outcomeType: 'UNKNOWN_INTENT',
        conversationState: localResult.conversationState,
      };
    }

    // Step 3: Online -> Groq Fallback
    const enableGroq = options?.enableGroqFallback !== false;
    const groq = options?.groqProvider || (options?.groqConfig ? new GroqCompanionProvider(options.groqConfig) : this.defaultGroqProvider);

    if (!enableGroq || !groq.isAvailable()) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.log('LLM source: offline_unknown');
      }
      return {
        answer: DEFAULT_UNKNOWN_RESPONSE,
        source: 'offline_unknown',
        intent: 'UNKNOWN',
        confidence: localResult.confidence,
        confidenceLevel: localResult.confidenceLevel,
        questionType: localResult.questionType,
        topic: localResult.topic,
        category: localResult.category,
        strategy: 'UNKNOWN',
        outcomeType: 'UNKNOWN_INTENT',
        conversationState: localResult.conversationState,
      };
    }

    try {
      const groqResult = await groq.process(rawQuery, context, conversationState);

      const updatedState = updateConversationState(
        conversationState,
        rawQuery,
        groqResult.normalizedQuery,
        'UNKNOWN',
        groqResult.response,
        localResult.entities
      );

      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.log('LLM source: groq');
      }

      return {
        answer: groqResult.response,
        source: 'groq',
        intent: 'UNKNOWN',
        confidence: groqResult.confidence,
        confidenceLevel: groqResult.confidenceLevel,
        questionType: 'UNKNOWN',
        topic: groqResult.topic || 'GENERAL_CONVERSATION',
        category: groqResult.category || 'CONVERSATION',
        strategy: 'GENERAL',
        outcomeType: 'RECOGNIZED',
        conversationState: updatedState,
      };
    } catch (error) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.log('LLM source: groq_error');
      }
      return {
        answer: DEFAULT_UNKNOWN_RESPONSE,
        source: 'groq_error',
        intent: 'UNKNOWN',
        confidence: 0,
        confidenceLevel: 'LOW',
        questionType: 'UNKNOWN',
        topic: 'UNKNOWN',
        category: 'UNKNOWN',
        strategy: 'UNKNOWN',
        outcomeType: 'UNKNOWN_INTENT',
        conversationState: localResult.conversationState,
      };
    }
  }

  /**
   * Compatibility method returning CompanionResult format.
   */
  public static async process(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState,
    options?: HybridEngineOptions
  ): Promise<CompanionResult> {
    const res = await this.askMitraCare(rawQuery, {
      ...options,
      context,
      conversationState,
    });

    return {
      intent: res.intent || 'UNKNOWN',
      confidence: res.confidence || 0,
      confidenceLevel: res.confidenceLevel || 'LOW',
      response: res.answer,
      normalizedQuery: rawQuery.toLowerCase().trim(),
      questionType: res.questionType || 'UNKNOWN',
      topic: res.topic || 'UNKNOWN',
      category: res.category || 'UNKNOWN',
      strategy: res.strategy || 'UNKNOWN',
      outcomeType: res.outcomeType || 'UNKNOWN_INTENT',
      subIntents: res.subIntents,
      entities: res.entities,
      conversationState: res.conversationState,
    };
  }

  /**
   * Process query with SQLite database context.
   */
  public static async processWithDatabase(
    rawQuery: string,
    conversationState?: ConversationState,
    options?: HybridEngineOptions
  ): Promise<CompanionResult> {
    return this.process(rawQuery, {}, conversationState, {
      ...options,
      useDatabaseContext: true,
    });
  }
}

/**
 * Top-level convenience function for the entire app.
 */
export async function askMitraCare(
  question: string,
  options?: HybridEngineOptions
): Promise<LLMResponse> {
  return HybridCompanionEngine.askMitraCare(question, options);
}
