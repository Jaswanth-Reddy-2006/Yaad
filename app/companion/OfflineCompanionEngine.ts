import {
  CompanionIntent,
  CompanionResult,
  ConversationState,
  PatientContext,
} from './types';
import {
  normalizeQuery,
  detectIntent,
  MatchEvaluation,
  extractEntities,
  detectQuestionType,
  detectTopic,
} from './intents';
import { generateResponse } from './templates';
import { PatientContextProvider } from './PatientContextProvider';
import { updateConversationState, createInitialConversationState } from './context';

export class OfflineCompanionEngine {
  /**
   * Synchronous processing pipeline:
   * USER QUERY -> NORMALIZATION -> STT CLEANUP -> QUESTION TYPE DETECTION -> TOPIC DETECTION -> ENTITY EXTRACTION -> CONTEXT CHECK -> INTENT SCORING -> KNOWLEDGE / RESPONSE SELECTION -> SAFETY CHECK -> FINAL RESPONSE
   */
  public static process(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState
  ): CompanionResult {
    const normalizedQuery = normalizeQuery(rawQuery);
    const evaluation = detectIntent(normalizedQuery, conversationState);
    const { intent, confidence, questionType, topic, category, subIntents, entities } = evaluation;

    const { response, outcomeType, strategy } = generateResponse(
      intent,
      context,
      subIntents,
      rawQuery,
      conversationState,
      entities
    );

    const updatedState = updateConversationState(
      conversationState,
      rawQuery,
      normalizedQuery,
      intent,
      response,
      entities
    );

    const confidenceLevel = confidence >= 0.85 ? 'HIGH' : confidence >= 0.6 ? 'MEDIUM' : 'LOW';

    return {
      intent,
      confidence,
      confidenceLevel,
      response,
      normalizedQuery,
      questionType,
      topic,
      category: category || 'UNKNOWN',
      strategy: strategy || 'FACTUAL',
      outcomeType,
      subIntents,
      entities,
      conversationState: updatedState,
    };
  }

  /**
   * Asynchronously fetches the latest patient context from the local SQLite database
   * and processes the query with optional conversation memory.
   */
  public static async processWithDatabase(
    rawQuery: string,
    conversationState?: ConversationState
  ): Promise<CompanionResult> {
    const context = await PatientContextProvider.getPatientContext();
    return this.process(rawQuery, context, conversationState);
  }

  /**
   * Creates a fresh conversation state.
   */
  public static createConversationState(): ConversationState {
    return createInitialConversationState();
  }

  /**
   * Helper to normalize a query string.
   */
  public static normalize(query: string): string {
    return normalizeQuery(query);
  }

  /**
   * Helper to extract entities from query text.
   */
  public static extract(query: string) {
    const normalized = normalizeQuery(query);
    return extractEntities(normalized);
  }

  /**
   * Helper to detect intent directly from a query string.
   */
  public static detect(
    query: string,
    state?: ConversationState
  ): MatchEvaluation {
    const normalized = normalizeQuery(query);
    return detectIntent(normalized, state);
  }

  /**
   * Helper to detect QuestionType.
   */
  public static questionType(query: string) {
    const normalized = normalizeQuery(query);
    return detectQuestionType(normalized);
  }

  /**
   * Helper to detect Topic.
   */
  public static topic(query: string) {
    const normalized = normalizeQuery(query);
    return detectTopic(normalized);
  }
}

export * from './types';
export * from './intents';
export * from './templates';
export * from './synonyms';
export * from './context';
export * from './knowledge';
export * from './PatientContextProvider';
