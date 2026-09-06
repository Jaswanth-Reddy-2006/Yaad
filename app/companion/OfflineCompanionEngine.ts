import { CompanionIntent, CompanionResult, PatientContext } from './types';
import { normalizeQuery, detectIntent, MatchEvaluation } from './intents';
import { generateResponse } from './templates';
import { PatientContextProvider } from './PatientContextProvider';

export class OfflineCompanionEngine {
  /**
   * Main synchronous processing pipeline:
   * Query -> Normalize -> Detect Intent -> Generate Template Response using supplied context
   */
  public static process(
    rawQuery: string,
    context: PatientContext = {}
  ): CompanionResult {
    const normalizedQuery = normalizeQuery(rawQuery);
    const { intent, confidence } = detectIntent(normalizedQuery);
    const response = generateResponse(intent, context);

    return {
      intent,
      confidence,
      response,
      normalizedQuery,
    };
  }

  /**
   * Asynchronously fetches the latest patient context from the existing local database
   * and processes the query.
   */
  public static async processWithDatabase(
    rawQuery: string
  ): Promise<CompanionResult> {
    const context = await PatientContextProvider.getPatientContext();
    return this.process(rawQuery, context);
  }

  /**
   * Helper to normalize a query string.
   */
  public static normalize(query: string): string {
    return normalizeQuery(query);
  }

  /**
   * Helper to detect intent directly from a query string.
   */
  public static detect(query: string): MatchEvaluation {
    const normalized = normalizeQuery(query);
    return detectIntent(normalized);
  }

  /**
   * Helper to format a response directly from an intent and context.
   */
  public static formatResponse(
    intent: CompanionIntent,
    context: PatientContext = {}
  ): string {
    return generateResponse(intent, context);
  }
}

export * from './types';
export * from './intents';
export * from './templates';
export * from './PatientContextProvider';
