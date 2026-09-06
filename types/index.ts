export type UserRole = 'PATIENT' | 'CAREGIVER' | 'DOCTOR' | 'HEALTHCARE_WORKER' | 'ADMIN';
export type GameType = 'PAIR' | 'TRIPLET' | 'COLOR_SEQUENCE' | string;
export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type GameStatus = 'IDLE' | 'READY' | 'PLAYING' | 'EVALUATING' | 'FEEDBACK' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'ERROR';

export interface PatientProfile {
  id: string; // Stable UUID
  displayName: string;
  age?: number;
  preferredLanguage: string; // 'en' | 'hi' | 'bn'
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityPreferences {
  textSize: 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
  highContrast: boolean;
  easyRead: boolean;
  elderMode: boolean;
}

export interface VoicePreferences {
  enabled: boolean;
  speechRate: number; // e.g. 0.8 to 1.0 (default slightly slower for elderly)
  pitch: number;
  language: string; // 'en-IN' | 'hi-IN' | 'bn-IN'
}

export interface ConnectionIdentity {
  patientId: string;
  connectionToken: string;
  connectionCode: string; // Alphanumeric human readable 6-character code
  qrPayload: string;
  createdAt: string;
}

export interface GameCardItem {
  id: string; // unique instance id on board
  symbolId: string; // matching pair/triplet key
  groupId: string; // alias for symbolId
  title: string;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
  isHighlightedHint?: boolean;
}

export interface GameSession {
  sessionId: string;
  patientId: string;
  gameId: GameType;
  difficulty: GameDifficulty;
  startedAt: string;
  completedAt?: string;
  status: GameStatus;
}

export interface GameResult {
  id: string;
  sessionId: string;
  patientId: string;
  gameId: GameType;
  difficulty: GameDifficulty;
  score: number;
  accuracy: number; // 0 - 100%
  durationSeconds: number;
  attempts: number;
  mistakes: number;
  hintsUsed: number;
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'ABANDONED';
}

export type ReminderCategory = 'MEDICINE' | 'HYDRATION' | 'ACTIVITY' | 'APPOINTMENT';
export type ReminderStatus = 'UPCOMING' | 'DUE' | 'UNACKNOWLEDGED' | 'COMPLETED' | 'MISSED' | 'SKIPPED' | 'ESCALATED';

export interface Reminder {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: ReminderCategory;
  scheduledTime: string; // HH:MM or ISO string
  status: ReminderStatus;
  isSnoozed?: boolean;
  createdAt: string;
}

export type TaskCategory = 'MEDICINE' | 'HYDRATION' | 'ACTIVITY' | 'ROUTINE';

export interface DailyTask {
  id: string;
  patientId: string;
  title: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export * from './voice';

