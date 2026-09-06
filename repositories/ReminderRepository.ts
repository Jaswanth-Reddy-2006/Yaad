import { getDatabase } from '../database/db';
import { Reminder, ReminderStatus } from '../types';
import { LOCAL_PATIENT_ID, ensurePatientProfile } from '../database/seed';
import { authService } from '../services/AuthService';

export interface IReminderRepository {
  getReminders(): Promise<Reminder[]>;
  getNextUpcomingReminder(): Promise<Reminder | null>;
  updateStatus(id: string, status: ReminderStatus): Promise<void>;
  snoozeReminder(id: string): Promise<void>;
}

export class SQLiteReminderRepository implements IReminderRepository {
  private async resolvePatientId(): Promise<string> {
    const authId = await authService.getUserId();
    return authId || LOCAL_PATIENT_ID;
  }

  async getReminders(): Promise<Reminder[]> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    const rows = (await db.getAllAsync(
      'SELECT * FROM reminders WHERE patient_id = ? ORDER BY id ASC',
      [patientId]
    )) as Array<{
      id: string;
      patient_id: string;
      title: string;
      description: string;
      category: string;
      scheduled_time: string;
      status: string;
      is_snoozed: number;
      created_at: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id,
      title: r.title,
      description: r.description,
      category: r.category as any,
      scheduledTime: r.scheduled_time,
      status: r.status as ReminderStatus,
      isSnoozed: Boolean(r.is_snoozed),
      createdAt: r.created_at,
    }));
  }

  async getNextUpcomingReminder(): Promise<Reminder | null> {
    const reminders = await this.getReminders();
    const upcoming = reminders.find((r) => r.status === 'UPCOMING' || r.status === 'DUE');
    return upcoming || null;
  }

  async updateStatus(id: string, status: ReminderStatus): Promise<void> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    await db.runAsync(
      'UPDATE reminders SET status = ? WHERE id = ? AND patient_id = ?',
      [status, id, patientId]
    );
  }

  async snoozeReminder(id: string): Promise<void> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    await db.runAsync(
      'UPDATE reminders SET is_snoozed = 1, status = "UPCOMING" WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );
  }
}

export const reminderRepository = new SQLiteReminderRepository();
