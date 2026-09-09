import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  OfflineCompanionEngine,
  HybridCompanionEngine,
  askMitraCare,
  GroqCompanionProvider,
  ResponseValidator,
  PatientContext,
  DEFAULT_UNKNOWN_RESPONSE,
} from '../app/companion';

describe('MitraCare Offline-First LLM Architecture & Groq Fallback', () => {
  const sampleContext: PatientContext = {
    patientName: 'Ramesh Sharma',
    preferredName: 'Ramesh',
    age: 72,
    caregiverName: 'Ananya',
    caregiverRelation: 'daughter',
    medicineName: 'Donepezil',
    medicineTime: '8:00 AM',
    medicineDosage: '5mg',
    location: 'Home, Bedroom',
    recommendedGame: 'Word Match',
  };

  let mockFetch: any;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Case 1: Local answer + no internet -> Local answer, Groq NOT called
  test('Case 1: Local answer + no internet -> returns local answer, source="local", Groq NOT called', async () => {
    const result = await askMitraCare('What is my name?', {
      context: sampleContext,
      connectivityOptions: { forceOffline: true },
      groqConfig: { apiKey: 'mock-groq-key' },
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.source).toBe('local');
    expect(result.intent).toBe('WHO_AM_I');
    expect(result.answer).toContain('Ramesh');
  });

  // Case 2: Local answer + internet -> Local answer, Groq NOT called
  test('Case 2: Local answer + internet -> returns local answer, source="local", Groq NOT called', async () => {
    const result = await askMitraCare('When is my medicine?', {
      context: sampleContext,
      connectivityOptions: { forceOnline: true },
      groqConfig: { apiKey: 'mock-groq-key' },
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.source).toBe('local');
    expect(result.intent).toBe('NEXT_MEDICINE');
    expect(result.answer).toMatch(/donepezil/i);
    expect(result.answer).toContain('8:00 AM');
  });

  // Case 3: Local unknown + internet -> Groq answer, source="groq"
  test('Case 3: Local unknown + internet -> calls Groq, returns Groq answer, source="groq"', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'The capital of Madagascar is Antananarivo.',
            },
          },
        ],
      }),
    });

    const result = await askMitraCare('What is the capital of Madagascar?', {
      context: sampleContext,
      connectivityOptions: { forceOnline: true },
      groqConfig: { apiKey: 'valid-groq-key' },
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('groq');
    expect(result.answer).toBe('The capital of Madagascar is Antananarivo.');
  });

  // Case 4: Local unknown + no internet -> Default unknown response, source="offline_unknown"
  test('Case 4: Local unknown + no internet -> returns default unknown response, source="offline_unknown"', async () => {
    const result = await askMitraCare('How far is the Moon from Earth?', {
      context: sampleContext,
      connectivityOptions: { forceOffline: true },
      groqConfig: { apiKey: 'valid-groq-key' },
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.source).toBe('offline_unknown');
    expect(result.answer).toBe(DEFAULT_UNKNOWN_RESPONSE);
  });

  // Case 5: Local unknown + internet + Groq API failure -> Default unknown response, source="groq_error", does not crash
  test('Case 5: Local unknown + internet + Groq API failure -> returns default unknown response, source="groq_error"', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network timeout or 500 internal error'));

    const result = await askMitraCare('Explain quantum gravity theory', {
      context: sampleContext,
      connectivityOptions: { forceOnline: true },
      groqConfig: { apiKey: 'valid-groq-key' },
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('groq_error');
    expect(result.answer).toBe(DEFAULT_UNKNOWN_RESPONSE);
  });

  // Case 6: Missing GROQ_API_KEY -> Local works, Unknown falls back gracefully without crashing
  test('Case 6: Missing GROQ_API_KEY -> Local works, Unknown falls back to default unknown response without crashing', async () => {
    // 6a: Local query still works perfectly with empty API key
    const localRes = await askMitraCare('Who is my caregiver?', {
      context: sampleContext,
      connectivityOptions: { forceOnline: true },
      groqConfig: { apiKey: '', useBackendProxy: false },
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(localRes.source).toBe('local');
    expect(localRes.answer).toContain('Ananya');

    // 6b: Unknown query falls back cleanly
    const unknownRes = await askMitraCare('What is string theory in physics?', {
      context: sampleContext,
      connectivityOptions: { forceOnline: true },
      groqConfig: { apiKey: '', useBackendProxy: false },
    });
    expect(unknownRes.source).toBe('offline_unknown');
    expect(unknownRes.answer).toBe(DEFAULT_UNKNOWN_RESPONSE);
  });

  describe('Core Offline Companion Queries Integrity', () => {
    test('Location query: "Where am I?" answered offline', async () => {
      const res = await askMitraCare('Where am I?', { context: sampleContext });
      expect(res.source).toBe('local');
      expect(res.answer).toContain('Home, Bedroom');
    });

    test('Game query: "Recommend a game" answered offline', async () => {
      const res = await askMitraCare('Recommend a game', { context: sampleContext });
      expect(res.source).toBe('local');
      expect(res.answer).toContain('Word Match');
    });

    test('Safety emergency query: "I want to hurt myself" is handled offline with safety priority', async () => {
      const res = await askMitraCare('I want to hurt myself', { context: sampleContext });
      expect(res.source).toBe('local');
      expect(res.intent).toBe('SAFETY_ALERT');
      expect(res.outcomeType).toBe('SAFETY_CRITICAL');
    });
  });

  describe('ResponseValidator Safety and Formatting', () => {
    test('Sanitizes Markdown formatting for clear speech', () => {
      const raw = 'Mitra: **The sky** is _blue_ because of `scattering`.';
      const sanitized = ResponseValidator.sanitize(raw);
      expect(sanitized).toBe('The sky is blue because of scattering.');
    });

    test('Rejects robotic AI disclaimers and prompts', () => {
      const validation = ResponseValidator.validate('As an AI language model, I cannot answer.');
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Violated safety filter');
    });

    test('Accepts valid, compassionate responses', () => {
      const valid = ResponseValidator.validate('Water helps your body stay hydrated and healthy.');
      expect(valid.isValid).toBe(true);
      expect(valid.sanitizedResponse).toBe('Water helps your body stay hydrated and healthy.');
    });
  });
});
