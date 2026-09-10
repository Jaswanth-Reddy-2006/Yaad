import { ICompanionProvider } from './CompanionProvider';
import {
  CompanionResult,
  ConversationState,
  PatientContext,
} from '../types';
import { ResponseValidator } from '../validation/ResponseValidator';
import { API_BASE_URL } from '../../../constants/config';

export interface GroqProviderConfig {
  apiKey?: string;
  model?: string;
  endpoint?: string;
  backendUrl?: string;
  timeoutMs?: number;
  useBackendProxy?: boolean;
}

export class GroqCompanionProvider implements ICompanionProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq Cloud LLM';

  private apiKey: string;
  private model: string;
  private endpoint: string;
  private backendUrl: string;
  private timeoutMs: number;
  private useBackendProxy: boolean;

  constructor(config: GroqProviderConfig = {}) {
    this.apiKey =
      config.apiKey ||
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GROQ_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
      '';
    this.model = config.model || 'llama-3.3-70b-versatile';
    this.endpoint = config.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
    this.backendUrl = config.backendUrl || `${API_BASE_URL}/api/v1/companion/ask`;
    this.timeoutMs = config.timeoutMs || 4000;
    this.useBackendProxy = config.useBackendProxy ?? (!this.apiKey && Boolean(this.backendUrl));
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0) || Boolean(this.useBackendProxy && this.backendUrl);
  }

  /**
   * Builds a dementia-friendly system prompt.
   */
  private buildSystemPrompt(context?: PatientContext): string {
    const patientName = context?.preferredName || context?.patientName;
    const caregiverName = context?.caregiverName;

    let prompt =
      'You are Mitra, a gentle, warm, and comforting companion for an elderly person with memory challenges. ' +
      'Answer clearly in 1 or 2 short, simple sentences. ' +
      'Be encouraging and reassuring. ' +
      'Do not give complex explanations, medical diagnoses, or numbered lists. ' +
      'Never say you are an AI.';

    if (patientName) {
      prompt += ` The person's name is ${patientName}.`;
    }
    if (caregiverName) {
      prompt += ` Their caregiver's name is ${caregiverName}.`;
    }

    return prompt;
  }

  public async process(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState
  ): Promise<CompanionResult> {
    if (!this.isAvailable()) {
      throw new Error('Groq API Key is not configured or available.');
    }

    const systemPrompt = this.buildSystemPrompt(context);
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Include last 2 turns if available for conversational continuity
    if (conversationState?.history && conversationState.history.length > 0) {
      const recentHistory = conversationState.history.slice(-2);
      for (const turn of recentHistory) {
        messages.push({ role: 'user', content: turn.query });
        messages.push({ role: 'assistant', content: turn.response });
      }
    }

    messages.push({ role: 'user', content: rawQuery });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let content = '';

      if (this.useBackendProxy && !this.apiKey) {
        // Query secure backend proxy
        const history = (conversationState?.history || []).slice(-2).map((h) => ({
          role: 'user',
          content: h.query,
        }));

        const response = await fetch(this.backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: rawQuery,
            patient_name: context?.preferredName || context?.patientName,
            caregiver_name: context?.caregiverName,
            conversation_history: history,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.text().catch(() => '');
          throw new Error(`Backend Groq proxy error HTTP ${response.status}: ${err}`);
        }

        const data = await response.json();
        content = data?.answer || '';
      } else {
        // Direct Groq API call
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            max_tokens: 120,
            temperature: 0.6,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Groq API error HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        content = data?.choices?.[0]?.message?.content || '';
      }

      const validation = ResponseValidator.validate(content);
      if (!validation.isValid) {
        throw new Error(`Groq response failed validation: ${validation.reason}`);
      }

      return {
        intent: 'UNKNOWN',
        confidence: 0.8,
        confidenceLevel: 'HIGH',
        response: validation.sanitizedResponse,
        normalizedQuery: rawQuery.toLowerCase().trim(),
        questionType: 'UNKNOWN',
        topic: 'GENERAL_CONVERSATION',
        category: 'CONVERSATION',
        strategy: 'GENERAL',
        outcomeType: 'RECOGNIZED',
        conversationState,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
