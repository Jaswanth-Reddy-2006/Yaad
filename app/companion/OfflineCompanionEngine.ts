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
  isGameplayAnalysisQuery,
} from './intents';
import { generateResponse } from './templates';
import { PatientContextProvider } from './PatientContextProvider';
import { updateConversationState, createInitialConversationState } from './context';
import { GameResult } from '../../types';

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
   * Formats recorded gameplay sessions into a concise, privacy-safe summary for Gemma analysis.
   * Only includes real gameplay statistics (game name, difficulty, score, accuracy, duration, mistakes, attempts, hints, date).
   * NEVER includes patient identity or unrelated personal data.
   */
  public static formatGameplayHistoryForPrompt(gameResults?: GameResult[]): string {
    if (!gameResults || gameResults.length === 0) {
      return 'Recorded Gameplay Sessions:\nNo gameplay records available yet (0 sessions played).';
    }

    const gameNameMap: Record<string, string> = {
      PAIR: 'Find the Match (Pair Matching)',
      TRIPLET: 'Spot the Difference / Triplets',
      REMEMBER: 'Remember Pictures (Visual Recall)',
    };

    const lines: string[] = [
      `Recorded Gameplay Sessions (total: ${gameResults.length}, ordered newest to oldest):`,
    ];

    gameResults.slice(0, 10).forEach((res, index) => {
      const gameLabel = gameNameMap[res.gameId] || res.gameId;
      const dateStr = res.completedAt ? res.completedAt.split('T')[0] : 'Unknown date';
      const parts = [
        `Session ${index + 1}${index === 0 ? ' (Latest)' : ''}: Game: ${gameLabel}`,
        `Difficulty: ${res.difficulty}`,
        `Score: ${res.score}`,
        `Accuracy: ${res.accuracy}%`,
        `Time Taken: ${res.durationSeconds}s`,
        `Mistakes: ${res.mistakes}`,
        `Attempts: ${res.attempts}`,
        `Hints Used: ${res.hintsUsed}`,
        `Status: ${res.status}`,
        `Date: ${dateStr}`,
      ];
      lines.push(`- ${parts.join(', ')}`);
    });

    return lines.join('\n');
  }

  /**
   * Queries local Ollama Gemma 3 1B when offline.
   * Sends ONLY the user's question, dementia-friendly/medical instructions,
   * and relevant gameplay statistics if asking about gameplay performance.
   * NEVER sends patient personal identity or unrelated database context to Gemma.
   */
  public static async queryOllamaGemma(
    rawQuery: string,
    timeoutMs: number = 8000,
    gameResults?: GameResult[]
  ): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let prompt = `You are a medical, dementia-care, and cognitive monitoring assistant.

Scope of allowed questions to answer:
1. Medical and dementia questions:
- Dementia, Alzheimer's disease, memory loss, cognitive health, symptoms, progression, dementia care, caregiver support, behavioral changes, communication, daily activities, routines.
- General health and medical questions, common symptoms, wellness.
- Safe, informational questions about medicines (do not recommend changing doses or stopping medicines; advise consulting a doctor or pharmacist).
- When to contact a doctor or seek emergency medical care.

2. Patient gameplay and cognitive performance analysis:
- Questions about games played, recent game results, scores, cognitive difficulty levels (EASY, MEDIUM, HARD), accuracy, time taken, mistakes, attempts, performance trends, improvement, or decline based on the Recorded Gameplay Sessions below.

Refusal rule for unrelated questions:
- If the question is NOT about medical health, dementia care, or patient cognitive game performance (such as programming, coding, Python, React, React Native, technology, tech stack, software, GitHub, hackathons, politics, current affairs, sports, entertainment, celebrities, commercial video games unrelated to the patient, general trivia, geography, travel, school, mathematics, or general technology), respond ONLY with: "I can help with medical, health, dementia, and your game performance."

Medical Safety & Non-Diagnostic Rules:
- Gameplay performance is NOT a medical diagnosis. The system is a supportive monitoring tool, not a diagnostic tool.
- Never diagnose dementia, Alzheimer's, MCI, depression, or any other medical condition from symptoms or game scores.
- Never say: "You have dementia", "The patient has dementia", "You are getting Alzheimer's", "This proves cognitive decline", or "The patient has lost cognitive ability".
- Instead use careful, supportive language such as: "The recent game results show...", "You appear to have more difficulty with...", "Your recent scores have improved.", "Performance has decreased compared with previous sessions.", "This may be worth discussing with a healthcare professional if the change continues."
- Do not treat a single poor score as evidence of decline. Prefer trends across multiple sessions.
- Keep answers concise, simple, dementia-friendly, calm, clear, caregiver-friendly, and non-judgmental (1 to 3 short sentences). Avoid complicated medical terminology.
- Never tell someone to start, stop, increase, or decrease prescription medication.
- Never shame or blame a person for memory or game difficulties.
- For emergency or urgent symptoms, advise seeking immediate emergency medical care.

Gameplay Analysis Guidelines:
- Only analyze data that actually exists in the Recorded Gameplay Sessions below. NEVER invent game names, scores, difficulty ratings, dates, attempts, mistakes, times, or previous results.
- For recent game queries, return the most recent actual game and its actual result.
- Use only the existing difficulty levels (EASY, MEDIUM, HARD). If difficulty is not available, say difficulty could not be determined.
- If there is no gameplay data or the requested info is not available, say: "I don't have your recent game results available right now." or "There isn't enough game history to identify a clear trend yet."
- If only one session exists: describe that single session only; do NOT claim improvement or decline.
- If scores are improving across sessions: mention the improvement.
- If scores are stable: say performance appears relatively stable.
- If scores are declining across multiple sessions: mention the observed decline gently and suggest discussing persistent changes with a doctor or caregiver if appropriate.
- Identify which games or difficulty levels appear easier or harder based on the actual scores and mistakes recorded.`;

      const isGameQuery = isGameplayAnalysisQuery(rawQuery) || (gameResults && gameResults.length > 0);
      if (isGameQuery) {
        const statsSummary = this.formatGameplayHistoryForPrompt(gameResults);
        prompt += `\n\n${statsSummary}`;
      }

      prompt += `\n\nQuestion: ${rawQuery.trim()}`;

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma3:1b',
          prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const content = typeof data?.response === 'string' ? data.response.trim() : '';
      return content.length > 0 ? content : null;
    } catch {
      return null;
    }
  }

  /**
   * Asynchronous processing pipeline with offline Gemma fallback:
   * 1. Evaluates existing local rule-based companion engine.
   * 2. If known -> returns existing answer immediately (Gemma is NOT called).
   * 3. If UNKNOWN -> checks internet connectivity.
   * 4. If online -> keeps existing behavior.
   * 5. If offline -> calls local Ollama Gemma 3 1B without any patient context.
   * 6. If Gemma returns answer -> returns Gemma's answer.
   * 7. If Gemma fails/unavailable/times out -> returns existing UNKNOWN response.
   */
  public static async processAsync(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState,
    options?: { forceOffline?: boolean; forceOnline?: boolean; timeoutMs?: number }
  ): Promise<CompanionResult & { source: 'local' | 'gemma' | 'offline_unknown' | 'online_unknown' }> {
    // Step 1: Evaluate existing engine
    const localResult = this.process(rawQuery, context, conversationState);
    const isKnown =
      localResult.intent !== 'UNKNOWN' &&
      localResult.outcomeType !== 'UNKNOWN_INTENT';

    // If known by existing engine, return existing answer immediately (Gemma NOT called)
    if (isKnown) {
      return {
        ...localResult,
        source: 'local',
      };
    }

    // Step 2: Check internet connectivity
    let isOnline = false;
    if (options?.forceOffline) {
      isOnline = false;
    } else if (options?.forceOnline) {
      isOnline = true;
    } else {
      try {
        const { checkInternetConnection } = await import('./network/connectivity');
        isOnline = await checkInternetConnection();
      } catch {
        isOnline = false;
      }
    }

    // If online, keep existing behavior (return existing UNKNOWN response)
    if (isOnline) {
      return {
        ...localResult,
        source: 'online_unknown',
      };
    }

    // Step 3: Offline -> try local Ollama Gemma 3 1B (with only relevant gameplay statistics if gameplay query)
    const gemmaAnswer = await this.queryOllamaGemma(
      rawQuery,
      options?.timeoutMs || 8000,
      context?.recentGameResults
    );

    if (gemmaAnswer) {
      const updatedState = updateConversationState(
        conversationState,
        rawQuery,
        normalizeQuery(rawQuery),
        'UNKNOWN',
        gemmaAnswer,
        localResult.entities
      );

      return {
        ...localResult,
        response: gemmaAnswer,
        outcomeType: 'RECOGNIZED',
        strategy: 'GENERAL',
        source: 'gemma',
        conversationState: updatedState,
      };
    }

    // Step 4: If Gemma fails/unavailable/times out, return existing UNKNOWN response
    return {
      ...localResult,
      source: 'offline_unknown',
    };
  }

  /**
   * Asynchronously fetches the latest patient context from the local SQLite database
   * and processes the query with optional conversation memory.
   */
  public static async processWithDatabase(
    rawQuery: string,
    conversationState?: ConversationState,
    options?: { forceOffline?: boolean; forceOnline?: boolean; timeoutMs?: number }
  ): Promise<CompanionResult & { source: 'local' | 'gemma' | 'offline_unknown' | 'online_unknown' }> {
    let context: PatientContext = {};
    try {
      context = await PatientContextProvider.getPatientContext();
    } catch {
      context = {};
    }
    return this.processAsync(rawQuery, context, conversationState, options);
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


