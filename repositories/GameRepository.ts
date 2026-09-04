import { getDatabase } from '../database/db';
import { GameResult, GameType } from '../types';
import { LOCAL_PATIENT_ID } from '../database/seed';
import { authService } from '../services/AuthService';

export interface IGameRepository {
  saveResult(result: Omit<GameResult, 'id' | 'patientId'>, patientId?: string): Promise<GameResult>;
  getRecentResults(limit?: number, patientId?: string): Promise<GameResult[]>;
  getCompletedCountToday(patientId?: string): Promise<number>;
}

export class SQLiteGameRepository implements IGameRepository {
  private async resolvePatientId(providedId?: string): Promise<string> {
    if (providedId) return providedId;
    const authId = await authService.getUserId();
    return authId || LOCAL_PATIENT_ID;
  }

  async saveResult(resultData: Omit<GameResult, 'id' | 'patientId'>, patientId?: string): Promise<GameResult> {
    const db: any = await getDatabase();
    const activePatientId = await this.resolvePatientId(patientId);
    const id = `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await db.runAsync(
      `INSERT INTO game_results (
        id, session_id, patient_id, game_id, difficulty, score, accuracy,
        duration_seconds, attempts, mistakes, hints_used, started_at, completed_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        resultData.sessionId,
        activePatientId,
        resultData.gameId,
        resultData.difficulty,
        resultData.score,
        resultData.accuracy,
        resultData.durationSeconds,
        resultData.attempts,
        resultData.mistakes,
        resultData.hintsUsed,
        resultData.startedAt,
        resultData.completedAt,
        resultData.status,
      ]
    );

    return {
      ...resultData,
      id,
      patientId: activePatientId,
    };
  }

  async getRecentResults(limit: number = 10, patientId?: string): Promise<GameResult[]> {
    const db: any = await getDatabase();
    const activePatientId = await this.resolvePatientId(patientId);
    const rows = (await db.getAllAsync(
      `SELECT * FROM game_results WHERE patient_id = ? ORDER BY completed_at DESC LIMIT ?`,
      [activePatientId, limit]
    )) as Array<{
      id: string;
      session_id: string;
      patient_id: string;
      game_id: string;
      difficulty: string;
      score: number;
      accuracy: number;
      duration_seconds: number;
      attempts: number;
      mistakes: number;
      hints_used: number;
      started_at: string;
      completed_at: string;
      status: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      patientId: r.patient_id,
      gameId: r.game_id as GameType,
      difficulty: r.difficulty as any,
      score: r.score,
      accuracy: r.accuracy,
      durationSeconds: r.duration_seconds,
      attempts: r.attempts,
      mistakes: r.mistakes,
      hintsUsed: r.hints_used,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      status: r.status as any,
    }));
  }

  async getCompletedCountToday(patientId?: string): Promise<number> {
    const db: any = await getDatabase();
    const activePatientId = await this.resolvePatientId(patientId);
    const todayPrefix = new Date().toISOString().split('T')[0];
    const row = (await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM game_results WHERE patient_id = ? AND completed_at LIKE ? AND status = 'COMPLETED'`,
      [activePatientId, `${todayPrefix}%`]
    )) as { count: number } | null;

    return row?.count ?? 0;
  }
}

export const gameRepository = new SQLiteGameRepository();
