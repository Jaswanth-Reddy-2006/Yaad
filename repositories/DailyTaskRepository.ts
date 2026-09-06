import { getDatabase } from '../database/db';
import { DailyTask } from '../types';
import { LOCAL_PATIENT_ID, ensurePatientProfile } from '../database/seed';
import { authService } from '../services/AuthService';

export interface IDailyTaskRepository {
  getDailyTasks(): Promise<DailyTask[]>;
  toggleTaskCompletion(id: string): Promise<DailyTask>;
  getDailyProgress(): Promise<{ completed: number; total: number }>;
}

export class SQLiteDailyTaskRepository implements IDailyTaskRepository {
  private async resolvePatientId(): Promise<string> {
    const authId = await authService.getUserId();
    return authId || LOCAL_PATIENT_ID;
  }

  async getDailyTasks(): Promise<DailyTask[]> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    const rows = (await db.getAllAsync(
      'SELECT * FROM daily_tasks WHERE patient_id = ?',
      [patientId]
    )) as Array<{
      id: string;
      patient_id: string;
      title: string;
      time_slot: string;
      category: string;
      is_completed: number;
      completed_at: string | null;
    }>;

    return rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id,
      title: r.title,
      timeSlot: r.time_slot as any,
      category: r.category as any,
      isCompleted: Boolean(r.is_completed),
      completedAt: r.completed_at ?? undefined,
    }));
  }

  async toggleTaskCompletion(id: string): Promise<DailyTask> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    const current = (await db.getFirstAsync(
      'SELECT is_completed FROM daily_tasks WHERE id = ? AND patient_id = ?',
      [id, patientId]
    )) as { is_completed: number } | null;

    if (!current) throw new Error('Task not found');

    const nextState = current.is_completed === 1 ? 0 : 1;
    const completedAt = nextState === 1 ? new Date().toISOString() : null;

    await db.runAsync(
      'UPDATE daily_tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND patient_id = ?',
      [nextState, completedAt, id, patientId]
    );

    const tasks = await this.getDailyTasks();
    return tasks.find((t) => t.id === id)!;
  }

  async getDailyProgress(): Promise<{ completed: number; total: number }> {
    const tasks = await this.getDailyTasks();
    const completed = tasks.filter((t) => t.isCompleted).length;
    return { completed, total: tasks.length };
  }
}

export const dailyTaskRepository = new SQLiteDailyTaskRepository();
