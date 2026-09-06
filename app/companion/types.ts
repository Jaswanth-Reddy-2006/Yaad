export type CompanionIntent =
  | 'GREETING'
  | 'WHO_AM_I'
  | 'WHO_IS_CAREGIVER'
  | 'WHERE_IS_CAREGIVER'
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
  | 'CANNOT_REMEMBER'
  | 'SCARED'
  | 'LONELY'
  | 'NEEDS_HELP'
  | 'PERSON_QUERY'
  | 'MULTI_INTENT'
  | 'UNKNOWN';

export interface ExtractedEntities {
  medicine?: string;
  person?: string;
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  emotion?: string;
  location?: string;
}

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

export interface ConversationTurn {
  query: string;
  normalizedQuery: string;
  intent: CompanionIntent;
  response: string;
  entities?: ExtractedEntities;
  timestamp: number;
}

export interface ConversationState {
  history: ConversationTurn[];
  previousIntent?: CompanionIntent;
  previousTopic?: 'medicine' | 'caregiver' | 'identity' | 'location' | 'schedule' | 'game' | 'emotion';
  previousEntities?: ExtractedEntities;
}

export interface CompanionResult {
  intent: CompanionIntent;
  confidence: number;
  response: string;
  normalizedQuery: string;
  subIntents?: CompanionIntent[];
  entities?: ExtractedEntities;
  conversationState?: ConversationState;
}

export interface MatchEvaluation {
  intent: CompanionIntent;
  confidence: number;
  entities?: ExtractedEntities;
  subIntents?: CompanionIntent[];
}
