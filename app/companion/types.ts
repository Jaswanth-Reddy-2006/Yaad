import { GameResult } from '../../types';

export type CompanionIntent =
  // Safety & Emergency
  | 'SAFETY_ALERT'
  | 'NEEDS_HELP'
  
  // Personal Identity & Caregiver & Family
  | 'WHO_AM_I'
  | 'PATIENT_AGE'
  | 'WHO_IS_CAREGIVER'
  | 'WHERE_IS_CAREGIVER'
  | 'CONTACT_CAREGIVER'
  | 'FAMILY_INFO'
  | 'WHERE_AM_I'
  | 'PATIENT_HOME'
  
  // Medication & Routine & Reminders & Appointments
  | 'NEXT_MEDICINE'
  | 'WHAT_MEDICINE'
  | 'MEDICINE_DOSAGE'
  | 'MEDICINE_TAKEN_QUERY'
  | 'NEXT_REMINDER'
  | 'TODAY_PLAN'
  | 'APPOINTMENT_QUERY'
  | 'TIME_DEVICE_QUERY'
  | 'DATE_DEVICE_QUERY'
  
  // Memories & Preferences
  | 'MEMORY_ABOUT_ME'
  | 'FAMILY_MEMORIES'
  | 'FAVORITE_ACTIVITY'
  | 'FAVORITE_FOOD'
  | 'FAVORITE_MUSIC'
  | 'FAVORITE_COLOR'
  | 'PREFERENCE_QUERY'
  
  // Games & Activities
  | 'RECOMMEND_GAME'
  | 'RECOMMEND_ACTIVITY'
  
  // Emotional Support & Memory Loss
  | 'SCARED'
  | 'LONELY'
  | 'CONFUSED'
  | 'CANNOT_REMEMBER'
  | 'EMOTIONAL_SUPPORT'
  
  // Conversational Etiquette & Multi-Turn
  | 'GREETING'
  | 'GOOD_MORNING'
  | 'GOOD_NIGHT'
  | 'THANK_YOU'
  | 'REPEAT'
  | 'REPEAT_PATIENT'
  | 'WHAT_ELSE'
  | 'TELL_JOKE'
  | 'TELL_STORY'
  
  // General Knowledge & Simple Reasoning
  | 'GENERAL_KNOWLEDGE'
  | 'SIMPLE_REASONING'
  | 'FAQ_DEMENTIA'
  | 'FAQ_MEMORY'
  | 'FAQ_REMINDERS'
  | 'FAQ_RELAX'
  | 'FAQ_WORRY'
  
  // Meta & Classification
  | 'CLARIFICATION_NEEDED'
  | 'MULTI_INTENT'
  | 'PERSON_QUERY'
  | 'UNKNOWN';

export type QuestionType =
  | 'WHO'
  | 'WHAT'
  | 'WHEN'
  | 'WHERE'
  | 'WHY'
  | 'HOW'
  | 'WHICH'
  | 'YES_NO'
  | 'REQUEST'
  | 'STATEMENT'
  | 'EMOTIONAL'
  | 'SAFETY'
  | 'SHORT_SPEECH'
  | 'UNKNOWN';

export type CompanionTopic =
  | 'SAFETY'
  | 'MEDICINE'
  | 'REMINDER'
  | 'CAREGIVER'
  | 'FAMILY'
  | 'PATIENT'
  | 'LOCATION'
  | 'TIME'
  | 'DATE'
  | 'ROUTINE'
  | 'APPOINTMENT'
  | 'GAME'
  | 'ACTIVITY'
  | 'MEMORY'
  | 'PREFERENCE'
  | 'HELP'
  | 'EMOTION'
  | 'GREETING'
  | 'GENERAL_KNOWLEDGE'
  | 'REASONING'
  | 'GENERAL_CONVERSATION'
  | 'FAQ'
  | 'UNKNOWN';

export type QuestionCategory =
  | 'PATIENT_FACT'
  | 'MEDICATION'
  | 'MEDICATION_TIME'
  | 'CAREGIVER'
  | 'FAMILY'
  | 'MEMORY'
  | 'ROUTINE'
  | 'REMINDER'
  | 'APPOINTMENT'
  | 'LOCATION'
  | 'PREFERENCE'
  | 'EMOTIONAL_SUPPORT'
  | 'ACTIVITY'
  | 'GAME'
  | 'HELP'
  | 'SAFETY'
  | 'GENERAL_KNOWLEDGE'
  | 'SIMPLE_REASONING'
  | 'CONVERSATION'
  | 'CLARIFICATION'
  | 'UNKNOWN';

export type ResponseStrategyType =
  | 'FACTUAL'
  | 'CONTEXTUAL'
  | 'PERSONALIZED'
  | 'GENERAL'
  | 'EMOTIONAL'
  | 'CLARIFICATION'
  | 'SAFETY'
  | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type OutcomeType =
  | 'SAFETY_CRITICAL'
  | 'RECOGNIZED'
  | 'KNOWN_INTENT_MISSING_DATA'
  | 'CLARIFICATION_NEEDED'
  | 'UNKNOWN_INTENT';

export interface ExtractedEntities {
  medicine?: string;
  person?: string;
  pronoun?: 'he' | 'she' | 'they' | 'it' | 'that' | 'her' | 'him';
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  emotion?: string;
  location?: string;
  dateType?: 'today' | 'tomorrow' | 'now';
  clarificationTarget?: string;
  preferenceType?: 'activity' | 'food' | 'music' | 'color' | 'general';
  numberA?: number;
  numberB?: number;
}

export interface PatientFamilyMember {
  name: string;
  relation: string;
  phone?: string;
  notes?: string;
}

export interface PatientMemoryItem {
  title: string;
  description: string;
  era?: string;
  peopleInvolved?: string[];
}

export interface PatientPreferences {
  favoriteActivity?: string;
  favoriteFood?: string;
  favoriteMusic?: string;
  favoriteColor?: string;
  hobbies?: string[];
  dislikes?: string[];
}

export interface PatientContext {
  // Identity
  patientName?: string;
  preferredName?: string;
  age?: number;
  preferredLanguage?: string;
  location?: string;
  homeAddress?: string;

  // People & Caregiver
  caregiverName?: string;
  caregiverRelation?: string;
  caregiverPhone?: string;
  caregiverLocation?: string;
  familyMembers?: PatientFamilyMember[];
  emergencyContact?: string;

  // Medication
  medicineName?: string;
  medicineTime?: string;
  medicineDosage?: string;
  medicineFrequency?: string;
  medicineInstructions?: string;

  // Reminders & Routine
  nextReminder?: string;
  nextReminderTime?: string;
  appointmentTitle?: string;
  appointmentTime?: string;
  appointmentLocation?: string;
  appointmentWith?: string;
  todayPlanSummary?: string;

  // Personalization & Preferences
  preferences?: PatientPreferences;
  favoriteActivity?: string;
  favoriteFood?: string;
  favoriteMusic?: string;
  favoriteColor?: string;
  recommendedGame?: string;
  recommendedActivity?: string;

  // Memories
  memories?: PatientMemoryItem[] | string[];

  // Gameplay & Activity
  recentGameResults?: GameResult[];

  // Conversation tracking
  lastResponse?: string;
  deviceTime?: string;
  deviceDate?: string;
}

export interface ConversationTurn {
  query: string;
  normalizedQuery: string;
  intent: CompanionIntent;
  response: string;
  topic?: CompanionTopic;
  category?: QuestionCategory;
  entities?: ExtractedEntities;
  timestamp: number;
}

export interface ConversationalObservation {
  key: string;
  value: string;
  confidence: number;
  occurrences: number;
  lastObserved: number;
}

export interface ConversationState {
  history: ConversationTurn[];
  previousIntent?: CompanionIntent;
  previousTopic?: CompanionTopic;
  previousCategory?: QuestionCategory;
  previousEntities?: ExtractedEntities;
  lastMentionedPerson?: string;
  lastMentionedMedicine?: string;
  lastMentionedAppointment?: string;
  lastMentionedActivity?: string;
  interactionCount?: number;
  observedPreferences?: Record<string, ConversationalObservation>;
}

export interface CompanionResult {
  intent: CompanionIntent;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  response: string;
  normalizedQuery: string;
  questionType: QuestionType;
  topic: CompanionTopic;
  category: QuestionCategory;
  strategy: ResponseStrategyType;
  outcomeType: OutcomeType;
  subIntents?: CompanionIntent[];
  entities?: ExtractedEntities;
  conversationState?: ConversationState;
}

export interface MatchEvaluation {
  intent: CompanionIntent;
  confidence: number;
  questionType: QuestionType;
  topic: CompanionTopic;
  category?: QuestionCategory;
  entities?: ExtractedEntities;
  subIntents?: CompanionIntent[];
}

export const DEFAULT_UNKNOWN_RESPONSE = "I don't have enough information to answer that right now.";

export type LLMSource = 'local' | 'groq' | 'offline_unknown' | 'groq_error';

export interface LLMResponse {
  answer: string;
  source: LLMSource;
  intent?: CompanionIntent;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  questionType?: QuestionType;
  topic?: CompanionTopic;
  category?: QuestionCategory;
  strategy?: ResponseStrategyType;
  outcomeType?: OutcomeType;
  subIntents?: CompanionIntent[];
  entities?: ExtractedEntities;
  conversationState?: ConversationState;
}

export interface LocalSystemResult {
  known: boolean;
  answer: string | null;
  companionResult?: CompanionResult;
}


