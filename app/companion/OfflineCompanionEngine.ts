import {
  CompanionIntent,
  CompanionResult,
  ConversationState,
  PatientContext,
} from './types';
import { normalizeQuery, detectIntent, MatchEvaluation, extractEntities } from './intents';
import { generateResponse } from './templates';
import { PatientContextProvider } from './PatientContextProvider';
import { updateConversationState, createInitialConversationState } from './context';

export class OfflineCompanionEngine {
  /**
   * Synchronous processing pipeline:
   * Query -> Normalize -> Detect Intent (with conversation context) -> Generate Response -> Update Conversation State
   */
  public static process(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState
  ): CompanionResult {
    const normalizedQuery = normalizeQuery(rawQuery);
    const evaluation = detectIntent(normalizedQuery, conversationState);
    const { intent, confidence, subIntents, entities } = evaluation;

    const response = generateResponse(intent, context, subIntents);

    const updatedState = updateConversationState(
      conversationState,
      rawQuery,
      normalizedQuery,
      intent,
      response,
      entities
    );

    return {
      intent,
      confidence,
      response,
      normalizedQuery,
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
   * Helper to format a response directly from an intent and context.
   */
  public static formatResponse(
    intent: CompanionIntent,
    context: PatientContext = {},
    subIntents?: CompanionIntent[]
  ): string {
    return generateResponse(intent, context, subIntents);
  }
}

export * from './types';
export * from './intents';
export * from './templates';
export * from './synonyms';
export * from './context';
export * from './PatientContextProvider';
