export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS patient_profile (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  age INTEGER,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accessibility_preferences (
  patient_id TEXT PRIMARY KEY,
  text_size TEXT NOT NULL DEFAULT 'NORMAL',
  high_contrast INTEGER NOT NULL DEFAULT 0,
  easy_read INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS voice_preferences (
  patient_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  speech_rate REAL NOT NULL DEFAULT 0.85,
  pitch REAL NOT NULL DEFAULT 1.0,
  language TEXT NOT NULL DEFAULT 'en-IN',
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connection_identity (
  patient_id TEXT PRIMARY KEY,
  connection_token TEXT NOT NULL,
  connection_code TEXT NOT NULL,
  qr_payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_sessions (
  session_id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'IDLE',
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_results (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  duration_seconds INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  mistakes INTEGER NOT NULL,
  hints_used INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING',
  is_snoozed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  title TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  category TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (patient_id) REFERENCES patient_profile(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  synced_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_results_patient ON game_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_patient ON daily_tasks(patient_id);
`;
