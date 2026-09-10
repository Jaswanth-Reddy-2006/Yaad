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

  describe('OfflineCompanionEngine Gemma Fallback Tests', () => {
    // 1. Known question -> existing answer
    test('1. Known question -> existing answer (returns local answer)', async () => {
      const res = await OfflineCompanionEngine.processAsync('What is my name?', sampleContext, undefined, {
        forceOffline: true,
      });
      expect(res.source).toBe('local');
      expect(res.response).toContain('Ramesh');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    // 2. Unknown general question + Ollama running -> Gemma answer
    test('2. Unknown general question + Ollama running -> returns Gemma answer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'The capital of France is Paris.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'What is the capital of France?',
        sampleContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      expect(res.response).toBe('The capital of France is Paris.');
    });

    // 3. Unknown general question + Ollama stopped -> existing UNKNOWN response
    test('3. Unknown general question + Ollama stopped/error -> returns existing UNKNOWN response', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused to localhost:11434'));

      const res = await OfflineCompanionEngine.processAsync(
        'What is the capital of France?',
        sampleContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('offline_unknown');
      expect(res.intent).toBe('UNKNOWN');
      expect(res.outcomeType).toBe('UNKNOWN_INTENT');
      expect(typeof res.response).toBe('string');
      expect(res.response.length).toBeGreaterThan(0);
    });

    // 4. Known question + Ollama running -> existing answer, Gemma must NOT be called
    test('4. Known question + Ollama running -> existing answer, Gemma must NOT be called', async () => {
      const res = await OfflineCompanionEngine.processAsync('When is my medicine?', sampleContext, undefined, {
        forceOffline: true,
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(res.source).toBe('local');
      expect(res.response).toMatch(/donepezil/i);
    });

    // 5. Verify no patient database/context is sent to Gemma
    test('5. Verify no patient database/context is sent to Gemma in prompt payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Paris is the capital.',
        }),
      });

      await OfflineCompanionEngine.processAsync('What is the capital of France?', sampleContext, undefined, {
        forceOffline: true,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      const url = callArgs[0];
      const requestOptions = callArgs[1];
      const body = JSON.parse(requestOptions.body);

      expect(url).toBe('http://localhost:11434/api/generate');
      expect(body.model).toBe('gemma3:1b');
      expect(body.stream).toBe(false);

      // Verify prompt contains ONLY question and general instruction, no patient data
      expect(body.prompt).toContain('What is the capital of France?');
      expect(body.prompt).not.toContain('Ramesh');
      expect(body.prompt).not.toContain('Donepezil');
      expect(body.prompt).not.toContain('Ananya');
      expect(body.prompt).not.toContain('Bedroom');
    });
  });

  describe('Gemma 3 1B Gameplay Data Analysis Tests', () => {
    const singleSessionContext: PatientContext = {
      ...sampleContext,
      recentGameResults: [
        {
          id: 'res-1',
          sessionId: 'sess-1',
          patientId: 'pat-1',
          gameId: 'PAIR',
          difficulty: 'EASY',
          score: 950,
          accuracy: 92,
          durationSeconds: 25,
          attempts: 5,
          mistakes: 1,
          hintsUsed: 0,
          startedAt: '2026-09-10T10:00:00Z',
          completedAt: '2026-09-10T10:00:25Z',
          status: 'COMPLETED',
        },
      ],
    };

    const multiSessionContext: PatientContext = {
      ...sampleContext,
      recentGameResults: [
        {
          id: 'res-3',
          sessionId: 'sess-3',
          patientId: 'pat-1',
          gameId: 'TRIPLET',
          difficulty: 'HARD',
          score: 450,
          accuracy: 50,
          durationSeconds: 90,
          attempts: 16,
          mistakes: 7,
          hintsUsed: 3,
          startedAt: '2026-09-10T11:00:00Z',
          completedAt: '2026-09-10T11:01:30Z',
          status: 'COMPLETED',
        },
        {
          id: 'res-2',
          sessionId: 'sess-2',
          patientId: 'pat-1',
          gameId: 'PAIR',
          difficulty: 'EASY',
          score: 960,
          accuracy: 95,
          durationSeconds: 22,
          attempts: 4,
          mistakes: 1,
          hintsUsed: 0,
          startedAt: '2026-09-09T10:00:00Z',
          completedAt: '2026-09-09T10:00:22Z',
          status: 'COMPLETED',
        },
        {
          id: 'res-1',
          sessionId: 'sess-1',
          patientId: 'pat-1',
          gameId: 'PAIR',
          difficulty: 'EASY',
          score: 900,
          accuracy: 88,
          durationSeconds: 30,
          attempts: 6,
          mistakes: 2,
          hintsUsed: 1,
          startedAt: '2026-09-08T10:00:00Z',
          completedAt: '2026-09-08T10:00:30Z',
          status: 'COMPLETED',
        },
      ],
    };

    const emptyGameContext: PatientContext = {
      ...sampleContext,
      recentGameResults: [],
    };

    // 1. Ask about recent game performance
    test('1. Ask about recent game performance -> passes gameplay stats to Gemma', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: "You've been doing well in your recent games with high accuracy.",
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'How am I doing in the games?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      expect(res.response).toContain("doing well");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Recorded Gameplay Sessions');
      expect(body.prompt).toContain('Score: 960');
      expect(body.prompt).toContain('Score: 450');
    });

    // 2. Ask which game is most difficult
    test('2. Ask which game is most difficult -> passes difficulty and mistakes data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'You performed well on the easy pair games, but had more difficulty with the hard triplet game.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'Which game is most difficult for me?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Difficulty: HARD');
      expect(body.prompt).toContain('Difficulty: EASY');
      expect(body.prompt).toContain('Mistakes: 7');
    });

    // 3. Ask whether scores are improving
    test('3. Ask whether scores are improving -> evaluates multiple sessions trend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Your pair matching scores have improved from 900 to 960 across recent sessions.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'Are my scores improving?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Are my scores improving?');
      expect(body.prompt).toContain('Session 2');
      expect(body.prompt).toContain('Session 3');
    });

    // 4. Ask whether scores are declining
    test('4. Ask whether scores are declining / caregiver monitoring question', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Performance on easier games has remained stable, though harder levels showed more mistakes.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'Are their scores getting worse?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
    });

    // 5. Test with only one session
    test('5. Test with only one session -> prompt instructs single-session description without false trends', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'In your last game, you scored 950 with 92% accuracy on Find the Match.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'How did I do in my game?',
        singleSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('total: 1');
      expect(body.prompt).toContain('If only one session exists: describe that single session only');
    });

    // 6. Test with multiple sessions
    test('6. Test with multiple sessions -> formatted accurately with session sequence', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'You have completed 3 game sessions recently.',
        }),
      });

      await OfflineCompanionEngine.processAsync(
        'Show me recent performance',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('total: 3');
      expect(body.prompt).toContain('Session 1 (Latest)');
    });

    // 7. Test when gameplay data is empty
    test('7. Test when gameplay data is empty -> prompt informs no gameplay records available yet', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: "There isn't enough game history yet to identify a pattern. Playing a few sessions will give us more information.",
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'How am I doing in the games?',
        emptyGameContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('No gameplay records available yet (0 sessions played)');
      expect(body.prompt).toContain('If there is no gameplay data or the requested info is not available');
    });

    // 8. Verify Gemma does not receive invented scores or unnecessary personal data
    test('8. Verify Gemma prompt does NOT contain invented scores and omits unnecessary personal info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'You scored 950 on Find the Match.',
        }),
      });

      await OfflineCompanionEngine.processAsync(
        'How did I do in the memory game?',
        singleSessionContext,
        undefined,
        { forceOffline: true }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      // Contains actual score
      expect(body.prompt).toContain('Score: 950');
      // Does NOT contain personal sensitive fields
      expect(body.prompt).not.toContain('Ramesh');
      expect(body.prompt).not.toContain('9876543210');
      expect(body.prompt).not.toContain('Donepezil');
    });

    // 9. Verify Gemma prompt contains strict non-diagnostic medical safety instructions
    test('9. Verify Gemma prompt contains strict non-diagnostic medical safety rules', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Game scores show good focus.',
        }),
      });

      await OfflineCompanionEngine.processAsync(
        'What cognitive areas seem difficult?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Gameplay performance is NOT a medical diagnosis');
      expect(body.prompt).toContain('The patient has dementia');
      expect(body.prompt).toContain('Never diagnose dementia, Alzheimer\'s, MCI, depression');
      expect(body.prompt).toContain('Do not treat a single poor score as evidence of decline');
    });

    // 10. Verify existing companion rule-based game recommendations are completely unchanged
    test('10. Existing rule-based game recommendations are completely unchanged', async () => {
      const res = await OfflineCompanionEngine.processAsync('Recommend a game', sampleContext, undefined, {
        forceOffline: true,
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(res.source).toBe('local');
      expect(res.intent).toBe('RECOMMEND_GAME');
      expect(res.response).toMatch(/Word Match|Match the Pair|memory match game/i);
    });

    // 11. Test: "What game did I play recently and how did I do?"
    test('11. Query: "What game did I play recently and how did I do?" -> passes recent session to Gemma', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'You recently played Find the Match on easy difficulty and scored 950 out of 1000 with 92% accuracy.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'What game did I play recently and how did I do?',
        singleSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('What game did I play recently and how did I do?');
      expect(body.prompt).toContain('Score: 950');
      expect(body.prompt).toContain('Find the Match');
    });

    // 12. Test: "What was my latest score?"
    test('12. Query: "What was my latest score?" -> includes latest score in prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Your latest score was 950 on Find the Match.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'What was my latest score?',
        singleSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Session 1 (Latest)');
      expect(body.prompt).toContain('Score: 950');
    });

    // 13. Test: "Which game is hardest for me?"
    test('13. Query: "Which game is hardest for me?" -> includes difficulty and mistake stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'You seemed to find the HARD difficulty triplet game more challenging than the easy pair game.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'Which game is hardest for me?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Difficulty: HARD');
      expect(body.prompt).toContain('Difficulty: EASY');
    });

    // 14. Test: "Am I improving?"
    test('14. Query: "Am I improving?" -> includes multi-session trend data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Your scores on Find the Match improved from 900 to 960 across your recent sessions.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'Am I improving?',
        multiSessionContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Am I improving?');
      expect(body.prompt).toContain('Score: 960');
      expect(body.prompt).toContain('Score: 900');
    });

    // 15. Test: Medical questions -> local FAQ handled locally, general medical answered by Gemma
    test('15. Medical questions -> local FAQ handled locally, general medical answered by Gemma without gameplay stats', async () => {
      // 1. "What is dementia?" is an existing local FAQ knowledge query -> returns local response
      const localRes = await OfflineCompanionEngine.processAsync(
        'What is dementia?',
        sampleContext,
        undefined,
        { forceOffline: true }
      );
      expect(localRes.source).toBe('local');
      expect(localRes.intent).toBe('FAQ_DEMENTIA');
      expect(localRes.response).toContain('Dementia');

      // 2. General medical/dementia question not in static FAQ table -> answered by Gemma
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Early signs of Alzheimer\'s include forgetting recently learned information, difficulty planning, and misplacing items.',
        }),
      });

      const res2 = await OfflineCompanionEngine.processAsync(
        'What are the early signs of Alzheimer\'s?',
        sampleContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res2.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('Scope of allowed questions to answer:');
      expect(body.prompt).toContain('Dementia, Alzheimer\'s disease');
      expect(body.prompt).not.toContain('Session 1');
      expect(body.prompt).not.toContain('Score:');
    });

    // 16. Test: Unrelated question: "What is the tech stack of this app?" -> prompt strictly instructs refusal
    test('16. Unrelated question: "What is the tech stack of this app?" -> prompt contains strict refusal rule', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'I can help with medical, health, dementia, and your game performance.',
        }),
      });

      const res = await OfflineCompanionEngine.processAsync(
        'What is the tech stack of this app?',
        sampleContext,
        undefined,
        { forceOffline: true }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res.source).toBe('gemma');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toContain('respond ONLY with: "I can help with medical, health, dementia, and your game performance."');
      expect(body.prompt).toContain('What is the tech stack of this app?');
    });
  });
});
