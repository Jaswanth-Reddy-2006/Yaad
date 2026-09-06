import { OfflineCompanionEngine } from './OfflineCompanionEngine';
import { PatientContext, ConversationState } from './types';

export const sampleDbContext: PatientContext = {
  patientName: 'Dada (Patient)',
  caregiverName: 'Ananya',
  caregiverRelation: 'Daughter',
  medicineName: 'Evening Memory Pill',
  medicineTime: '08:00 PM',
  nextReminder: 'Cognitive Game Activity',
  nextReminderTime: '03:00 PM',
  todayPlanSummary: 'Play Match the Pair game and Light 10-minute evening walk',
  recommendedGame: 'Match the Pair',
  recommendedActivity: 'listening to relaxing classical songs',
};

export const emptyContext: PatientContext = {};

export interface SingleTestCase {
  name: string;
  query: string;
  context: PatientContext;
  expectedIntent: string;
  expectedSnippet?: string;
}

export const SINGLE_TEST_CASES: SingleTestCase[] = [
  // A. Different Phrasings for Medicine
  {
    name: 'Phrasing 1 - Standard',
    query: 'When is my medicine?',
    context: sampleDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: '08:00 PM',
  },
  {
    name: 'Phrasing 2 - Verb variation',
    query: 'When do I take my medicine?',
    context: sampleDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: '08:00 PM',
  },
  {
    name: 'Phrasing 3 - Time variation',
    query: 'What time is my medicine?',
    context: sampleDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: '08:00 PM',
  },
  {
    name: 'Phrasing 4 - Contraction',
    query: "When's my medicine?",
    context: sampleDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: '08:00 PM',
  },

  // B. Typos & Misspellings
  {
    name: 'Typo in question & keyword',
    query: 'whn is my medicne?',
    context: sampleDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: '08:00 PM',
  },
  {
    name: 'Typo in caregiver',
    query: 'who is my cargiver?',
    context: sampleDbContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedSnippet: 'Ananya',
  },
  {
    name: 'Typo in emotion',
    query: 'i am scard',
    context: sampleDbContext,
    expectedIntent: 'SCARED',
    expectedSnippet: "You're safe",
  },

  // C. Caregiver Variations
  {
    name: 'Caregiver phrase 1',
    query: 'Who takes care of me?',
    context: sampleDbContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedSnippet: 'Ananya',
  },
  {
    name: 'Caregiver phrase 2',
    query: 'Who looks after me?',
    context: sampleDbContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedSnippet: 'Ananya',
  },
  {
    name: 'Caregiver phrase 3 (Carer)',
    query: 'Who is my carer?',
    context: sampleDbContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedSnippet: 'Ananya',
  },

  // E. Emotional / Dementia Queries
  {
    name: 'Emotional - Scared',
    query: "I'm scared.",
    context: sampleDbContext,
    expectedIntent: 'SCARED',
    expectedSnippet: "You're safe. I'm here with you.",
  },
  {
    name: 'Emotional - Confused',
    query: "I'm confused.",
    context: sampleDbContext,
    expectedIntent: 'CONFUSED',
    expectedSnippet: 'Take your time. You are safe, and everything is okay.',
  },
  {
    name: 'Emotional - Disoriented',
    query: "I don't know where I am.",
    context: sampleDbContext,
    expectedIntent: 'WHERE_AM_I',
    expectedSnippet: 'You are in a safe and comfortable place.',
  },
  {
    name: 'Emotional - Memory Loss',
    query: "I can't remember.",
    context: sampleDbContext,
    expectedIntent: 'CANNOT_REMEMBER',
    expectedSnippet: 'It is completely okay to forget.',
  },
  {
    name: 'Emotional - Loneliness',
    query: 'Nobody is here.',
    context: sampleDbContext,
    expectedIntent: 'LONELY',
    expectedSnippet: 'Ananya is nearby',
  },

  // F. Unknown Questions (Safe non-hallucinating responses)
  {
    name: 'Unknown query 1',
    query: 'Tell me about quantum physics.',
    context: sampleDbContext,
    expectedIntent: 'UNKNOWN',
  },
  {
    name: 'Unknown query 2',
    query: 'What is the stock price of Apple?',
    context: sampleDbContext,
    expectedIntent: 'UNKNOWN',
  },

  // G. Multi-Intent
  {
    name: 'Multi-intent compound question',
    query: 'When is my medicine and who is my caregiver?',
    context: sampleDbContext,
    expectedIntent: 'MULTI_INTENT',
    expectedSnippet: '08:00 PM',
  },

  // H. Missing Information Handling (Truthful Fallbacks)
  {
    name: 'Missing caregiver info fallback',
    query: 'Who is my caregiver?',
    context: emptyContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedSnippet: 'Your caregiver is right here taking care of you.',
  },
  {
    name: 'Missing medicine info fallback',
    query: 'When is my medicine?',
    context: emptyContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedSnippet: 'You do not have any upcoming medicines scheduled right now.',
  },
];

/**
 * Runs the comprehensive test suite including multi-turn follow-ups.
 */
export function runCompanionTests(): { passed: number; failed: number; results: any[] } {
  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  // 1. Run single query test cases
  for (const test of SINGLE_TEST_CASES) {
    const result = OfflineCompanionEngine.process(test.query, test.context);
    const intentOk = result.intent === test.expectedIntent;
    const snippetOk = !test.expectedSnippet || result.response.includes(test.expectedSnippet);
    const success = intentOk && snippetOk;

    if (success) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      test: test.name,
      query: test.query,
      expectedIntent: test.expectedIntent,
      actualIntent: result.intent,
      response: result.response,
      status: success ? 'PASSED' : 'FAILED',
    });
  }

  // 2. Multi-turn Follow-Up Test Sequence
  // Turn 1: "When is my medicine?"
  let convState: ConversationState = OfflineCompanionEngine.createConversationState();
  const turn1 = OfflineCompanionEngine.process('When is my medicine?', sampleDbContext, convState);
  convState = turn1.conversationState!;

  const turn1Ok = turn1.intent === 'NEXT_MEDICINE' && turn1.response.includes('08:00 PM');
  if (turn1Ok) passed++; else failed++;
  results.push({
    test: 'Follow-Up Sequence Turn 1',
    query: 'When is my medicine?',
    expectedIntent: 'NEXT_MEDICINE',
    actualIntent: turn1.intent,
    response: turn1.response,
    status: turn1Ok ? 'PASSED' : 'FAILED',
  });

  // Turn 2: "What is it?" (Should understand "it" refers to the medicine from Turn 1)
  const turn2 = OfflineCompanionEngine.process('What is it?', sampleDbContext, convState);
  convState = turn2.conversationState!;

  const turn2Ok = turn2.intent === 'WHAT_MEDICINE' && turn2.response.includes('Evening Memory Pill');
  if (turn2Ok) passed++; else failed++;
  results.push({
    test: 'Follow-Up Sequence Turn 2 (Medicine context)',
    query: 'What is it?',
    expectedIntent: 'WHAT_MEDICINE',
    actualIntent: turn2.intent,
    response: turn2.response,
    status: turn2Ok ? 'PASSED' : 'FAILED',
  });

  // Turn 3: "Who is my caregiver?"
  const turn3 = OfflineCompanionEngine.process('Who is my caregiver?', sampleDbContext, convState);
  convState = turn3.conversationState!;

  // Turn 4: "Where is she?" (Should understand "she" refers to caregiver)
  const turn4 = OfflineCompanionEngine.process('Where is she?', sampleDbContext, convState);
  const turn4Ok = turn4.intent === 'WHERE_IS_CAREGIVER' && turn4.response.includes('Ananya is nearby');
  if (turn4Ok) passed++; else failed++;
  results.push({
    test: 'Follow-Up Sequence Turn 4 (Caregiver context)',
    query: 'Where is she?',
    expectedIntent: 'WHERE_IS_CAREGIVER',
    actualIntent: turn4.intent,
    response: turn4.response,
    status: turn4Ok ? 'PASSED' : 'FAILED',
  });

  return { passed, failed, results };
}
