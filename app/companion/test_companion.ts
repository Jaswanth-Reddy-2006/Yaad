import { OfflineCompanionEngine } from './OfflineCompanionEngine';
import { PatientContext } from './types';

export const seededDbContext: PatientContext = {
  patientName: 'Dada (Patient)',
  medicineName: 'Evening Memory Pill',
  medicineTime: '08:00 PM',
  nextReminder: 'Cognitive Game Activity',
  nextReminderTime: '03:00 PM',
  todayPlanSummary: 'Play Match the Pair game and Light 10-minute evening walk',
  recommendedActivity: 'Play Match the Pair game',
};

export const emptyContext: PatientContext = {};

export interface TestCase {
  description: string;
  query: string;
  context: PatientContext;
  expectedIntent: string;
  expectedResponseSnippet?: string;
}

export const TEST_CASES: TestCase[] = [
  // 1. Who am I?
  {
    description: 'Patient identity with DB context',
    query: 'Who am I?',
    context: seededDbContext,
    expectedIntent: 'WHO_AM_I',
    expectedResponseSnippet: 'Your name is Dada (Patient).',
  },
  // 2. Who is my caregiver?
  {
    description: 'Caregiver query (calm fallback when not explicitly bound in DB table)',
    query: 'Who is my caregiver?',
    context: seededDbContext,
    expectedIntent: 'WHO_IS_CAREGIVER',
    expectedResponseSnippet: 'Your caregiver is right here taking care of you.',
  },
  // 3. When is my medicine?
  {
    description: 'Medicine schedule from DB reminder',
    query: 'When is my medicine?',
    context: seededDbContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedResponseSnippet: 'Your evening memory pill is scheduled for 08:00 PM.',
  },
  // 4. What medicine do I take?
  {
    description: 'Medicine name from DB reminder',
    query: 'What medicine do I take?',
    context: seededDbContext,
    expectedIntent: 'WHAT_MEDICINE',
    expectedResponseSnippet: 'You take Evening Memory Pill.',
  },
  // 5. Where am I?
  {
    description: 'Location query (safe fallback when location is not in DB)',
    query: 'Where am I?',
    context: seededDbContext,
    expectedIntent: 'WHERE_AM_I',
    expectedResponseSnippet: 'You are in a safe and comfortable place.',
  },
  // 6. What is my next reminder?
  {
    description: 'Next upcoming reminder from DB',
    query: 'What is my next reminder?',
    context: seededDbContext,
    expectedIntent: 'NEXT_REMINDER',
    expectedResponseSnippet: 'Your next reminder is Cognitive Game Activity at 03:00 PM.',
  },
  // 7. Unknown question
  {
    description: 'Safe fallback for unknown query',
    query: 'Can you solve advanced calculus?',
    context: seededDbContext,
    expectedIntent: 'UNKNOWN',
    expectedResponseSnippet: "I'm not sure I understood. Please ask me again.",
  },
  // 8. Missing patient information (empty context)
  {
    description: 'Missing medicine in empty context',
    query: 'When is my medicine?',
    context: emptyContext,
    expectedIntent: 'NEXT_MEDICINE',
    expectedResponseSnippet: 'You do not have any upcoming medicines scheduled right now.',
  },
  {
    description: 'Missing patient profile in empty context',
    query: 'What is my name?',
    context: emptyContext,
    expectedIntent: 'WHO_AM_I',
    expectedResponseSnippet: 'You are safe and surrounded by people who care about you.',
  },
  // 9. Database / query failure (resilient to empty context)
  {
    description: 'Resilience on DB failure / empty context for next reminder',
    query: 'What should I do next?',
    context: emptyContext,
    expectedIntent: 'NEXT_REMINDER',
    expectedResponseSnippet: 'You have no upcoming reminders right now.',
  },
  // 10. Reassurance questions
  {
    description: 'Emotional reassurance when scared',
    query: "I'm scared",
    context: seededDbContext,
    expectedIntent: 'SCARED',
    expectedResponseSnippet: "You're safe. I'm here with you.",
  },
  {
    description: 'Emotional reassurance when confused',
    query: 'I feel confused',
    context: seededDbContext,
    expectedIntent: 'CONFUSED',
    expectedResponseSnippet: 'Take your time. You are safe, and everything is okay.',
  },
];

export function runCompanionTests(): { passed: number; failed: number; results: any[] } {
  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  for (const test of TEST_CASES) {
    const result = OfflineCompanionEngine.process(test.query, test.context);
    const intentOk = result.intent === test.expectedIntent;
    const responseOk = !test.expectedResponseSnippet || result.response.includes(test.expectedResponseSnippet);
    const isSuccess = intentOk && responseOk;

    if (isSuccess) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      description: test.description,
      query: test.query,
      expectedIntent: test.expectedIntent,
      actualIntent: result.intent,
      expectedResponseSnippet: test.expectedResponseSnippet,
      actualResponse: result.response,
      status: isSuccess ? 'PASSED' : 'FAILED',
    });
  }

  return { passed, failed, results };
}
