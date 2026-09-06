export type CompanionIntent =
  | 'GREETING'
  | 'WHO_AM_I'
  | 'WHO_IS_CAREGIVER'
  | 'WHERE_AM_I'
  | 'NEXT_MEDICINE'
  | 'WHAT_MEDICINE'
  | 'NEXT_REMINDER'
  | 'TODAY_PLAN'
  | 'RECOMMEND_GAME'
  | 'RECOMMEND_ACTIVITY'
  | 'REPEAT'
  | 'THANK_YOU'
  | 'GOOD_MORNING'
  | 'GOOD_NIGHT'
  | 'CONFUSED'
  | 'SCARED'
  | 'NEEDS_HELP'
  | 'UNKNOWN';

export interface PatientContext {
  patientName?: string;
  caregiverName?: string;
  caregiverRelation?: string;
  location?: string;
  medicineName?: string;
  medicineTime?: string;
  nextReminder?: string;
  nextReminderTime?: string;
  todayPlanSummary?: string;
  recommendedGame?: string;
  recommendedActivity?: string;
  lastResponse?: string;
}

export interface CompanionResult {
  intent: CompanionIntent;
  confidence: number;
  response: string;
  normalizedQuery: string;
}

export interface IntentRule {
  intent: CompanionIntent;
  priority: number;
  exactMatches?: string[];
  patterns?: RegExp[];
  requiredKeywords?: string[][]; // Array of keyword groups; all words in at least one group must be present
}
