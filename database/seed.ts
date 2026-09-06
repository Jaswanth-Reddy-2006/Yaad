import { SQLiteDatabase } from 'expo-sqlite';
import { PatientProfile, ConnectionIdentity, DailyTask, Reminder } from '../types';

export const LOCAL_PATIENT_ID = 'local-dev-patient-uuid-001';

export async function ensurePatientProfile(
  db: any,
  patientId: string,
  displayName: string = 'Dada (Patient)'
): Promise<void> {
  if (!patientId) return;
  const now = new Date().toISOString();

  try {
    // 1. Ensure patient profile exists
    await db.runAsync(
      `INSERT OR IGNORE INTO patient_profile (id, display_name, age, preferred_language, timezone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, displayName, 72, 'en', 'Asia/Kolkata', now, now]
    );

    // 2. Ensure accessibility preferences exist
    await db.runAsync(
      `INSERT OR IGNORE INTO accessibility_preferences (patient_id, text_size, high_contrast, easy_read)
       VALUES (?, ?, ?, ?)`,
      [patientId, 'LARGE', 0, 1]
    );

    // 3. Ensure voice preferences exist
    await db.runAsync(
      `INSERT OR IGNORE INTO voice_preferences (patient_id, enabled, speech_rate, pitch, language)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, 1, 0.85, 1.0, 'en-IN']
    );
  } catch (e) {
    // Guard against concurrency or already-existing rows
  }
}

export async function seedDatabase(db: SQLiteDatabase | any): Promise<void> {
  const now = new Date().toISOString();

  // Known profiles to ensure
  const defaultProfiles = [
    { id: LOCAL_PATIENT_ID, name: 'Dada (Patient)' },
    { id: 'pt-001', name: 'Ramesh Kumar' },
    { id: 'usr-new-001', name: 'Patient' },
  ];

  for (const prof of defaultProfiles) {
    await ensurePatientProfile(db, prof.id, prof.name);
  }

  // Check if initial tasks exist for LOCAL_PATIENT_ID
  const existingTasks = (await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM daily_tasks WHERE patient_id = ?',
    [LOCAL_PATIENT_ID]
  )) as { count: number } | null;

  if (!existingTasks || existingTasks.count === 0) {
    // 4. Insert Connection Identity (Opaque local token & real readable QR payload)
    const token = 'DEV-PATIENT-CONN-987654321';
    const code = 'YAAD-789';
    const qrPayload = JSON.stringify({
      version: 1,
      type: 'YAAD_PATIENT_PAIRING',
      patientId: LOCAL_PATIENT_ID,
      token: token,
      code: code,
      createdAt: now,
    });

    await db.runAsync(
      `INSERT OR IGNORE INTO connection_identity (patient_id, connection_token, connection_code, qr_payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [LOCAL_PATIENT_ID, token, code, qrPayload, now]
    );

    // 5. Insert Initial Daily Tasks for My Day
    const initialTasks: Omit<DailyTask, 'patientId'>[] = [
      { id: 'task-1', title: 'Drink a glass of warm water', timeSlot: 'MORNING', category: 'HYDRATION', isCompleted: true, completedAt: now },
      { id: 'task-2', title: 'Take morning memory medicine', timeSlot: 'MORNING', category: 'MEDICINE', isCompleted: true, completedAt: now },
      { id: 'task-3', title: 'Play Match the Pair game', timeSlot: 'AFTERNOON', category: 'ACTIVITY', isCompleted: false },
      { id: 'task-4', title: 'Light 10-minute evening walk', timeSlot: 'EVENING', category: 'ROUTINE', isCompleted: false },
      { id: 'task-5', title: 'Take evening medicine', timeSlot: 'EVENING', category: 'MEDICINE', isCompleted: false },
    ];

    for (const task of initialTasks) {
      for (const prof of defaultProfiles) {
        await db.runAsync(
          `INSERT OR IGNORE INTO daily_tasks (id, patient_id, title, time_slot, category, is_completed, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`${task.id}-${prof.id}`, prof.id, task.title, task.timeSlot, task.category, task.isCompleted ? 1 : 0, task.completedAt || null]
        );
      }
    }

    // 6. Insert Initial Reminders
    const initialReminders: Omit<Reminder, 'patientId'>[] = [
      {
        id: 'rem-1',
        title: 'Morning Medicine',
        description: 'Take 1 Tablet with warm water after breakfast',
        category: 'MEDICINE',
        scheduledTime: '08:30 AM',
        status: 'COMPLETED',
        createdAt: now,
      },
      {
        id: 'rem-2',
        title: 'Hydration Break',
        description: 'Drink 1 full glass of water',
        category: 'HYDRATION',
        scheduledTime: '11:00 AM',
        status: 'COMPLETED',
        createdAt: now,
      },
      {
        id: 'rem-3',
        title: 'Cognitive Game Activity',
        description: 'Spend 10 minutes playing Match the Pair',
        category: 'ACTIVITY',
        scheduledTime: '03:00 PM',
        status: 'UPCOMING',
        createdAt: now,
      },
      {
        id: 'rem-4',
        title: 'Evening Memory Pill',
        description: 'Take 1 Pill after evening tea',
        category: 'MEDICINE',
        scheduledTime: '08:00 PM',
        status: 'UPCOMING',
        createdAt: now,
      },
    ];

    for (const rem of initialReminders) {
      for (const prof of defaultProfiles) {
        await db.runAsync(
          `INSERT OR IGNORE INTO reminders (id, patient_id, title, description, category, scheduled_time, status, is_snoozed, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [`${rem.id}-${prof.id}`, prof.id, rem.title, rem.description, rem.category, rem.scheduledTime, rem.status, 0, rem.createdAt]
        );
      }
    }
  }
}
