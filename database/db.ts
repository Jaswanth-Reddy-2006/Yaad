import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import { seedDatabase } from './seed';

class WebSQLiteDatabase {
  private profile: any = null;
  private accPrefs: any = null;
  private voicePrefs: any = null;
  private connection: any = null;
  private gameResults: any[] = [];
  private reminders: any[] = [];
  private tasks: any[] = [];

  async execAsync(sql: string): Promise<void> {}

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    const cleanSql = sql.trim().toUpperCase();
    if (cleanSql.startsWith('INSERT INTO PATIENT_PROFILE')) {
      this.profile = {
        id: params[0],
        display_name: params[1],
        age: params[2],
        preferred_language: params[3],
        timezone: params[4],
        created_at: params[5],
        updated_at: params[6],
      };
    } else if (cleanSql.startsWith('UPDATE PATIENT_PROFILE')) {
      if (this.profile) {
        this.profile.display_name = params[0];
        this.profile.updated_at = params[1];
      }
    } else if (cleanSql.startsWith('INSERT INTO ACCESSIBILITY_PREFERENCES')) {
      this.accPrefs = { text_size: params[1], high_contrast: params[2], easy_read: params[3] };
    } else if (cleanSql.startsWith('UPDATE ACCESSIBILITY_PREFERENCES')) {
      this.accPrefs = { ...this.accPrefs, text_size: params[0], high_contrast: params[1], easy_read: params[2] };
    } else if (cleanSql.startsWith('INSERT INTO VOICE_PREFERENCES')) {
      this.voicePrefs = { enabled: params[0], speech_rate: params[1], pitch: params[2], language: params[3] };
    } else if (cleanSql.startsWith('UPDATE VOICE_PREFERENCES')) {
      this.voicePrefs = { ...this.voicePrefs, enabled: params[0], speech_rate: params[1], pitch: params[2], language: params[3] };
    } else if (cleanSql.startsWith('INSERT INTO CONNECTION_IDENTITY')) {
      this.connection = {
        patient_id: params[0],
        connection_token: params[1],
        connection_code: params[2],
        qr_payload: params[3],
        created_at: params[4],
      };
    } else if (cleanSql.startsWith('INSERT INTO GAME_RESULTS')) {
      const res = {
        id: params[0],
        session_id: params[1],
        patient_id: params[2],
        game_id: params[3],
        difficulty: params[4],
        score: params[5],
        accuracy: params[6],
        duration_seconds: params[7],
        attempts: params[8],
        mistakes: params[9],
        hints_used: params[10],
        started_at: params[11],
        completed_at: params[12],
        status: params[13],
      };
      this.gameResults.unshift(res);
    } else if (cleanSql.startsWith('INSERT INTO DAILY_TASKS')) {
      this.tasks.push({
        id: params[0],
        patient_id: params[1],
        title: params[2],
        time_slot: params[3],
        category: params[4],
        is_completed: params[5],
        completed_at: params[6],
      });
    } else if (cleanSql.startsWith('UPDATE DAILY_TASKS')) {
      const t = this.tasks.find((x) => x.id === params[2]);
      if (t) {
        t.is_completed = params[0];
        t.completed_at = params[1];
      }
    } else if (cleanSql.startsWith('INSERT INTO REMINDERS')) {
      this.reminders.push({
        id: params[0],
        patient_id: params[1],
        title: params[2],
        description: params[3],
        category: params[4],
        scheduled_time: params[5],
        status: params[6],
        is_snoozed: params[7],
        created_at: params[8],
      });
    } else if (cleanSql.startsWith('UPDATE REMINDERS SET STATUS')) {
      const r = this.reminders.find((x) => x.id === params[1]);
      if (r) {
        r.status = params[0];
      }
    } else if (cleanSql.startsWith('UPDATE REMINDERS SET IS_SNOOZED')) {
      const r = this.reminders.find((x) => x.id === params[0]);
      if (r) {
        r.is_snoozed = 1;
        r.status = 'UPCOMING';
      }
    }
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const cleanSql = sql.trim().toUpperCase();
    if (cleanSql.includes('FROM PATIENT_PROFILE')) return this.profile as T;
    if (cleanSql.includes('FROM ACCESSIBILITY_PREFERENCES')) return this.accPrefs as T;
    if (cleanSql.includes('FROM VOICE_PREFERENCES')) return this.voicePrefs as T;
    if (cleanSql.includes('FROM CONNECTION_IDENTITY')) return this.connection as T;
    if (cleanSql.includes('FROM DAILY_TASKS WHERE ID')) {
      const t = this.tasks.find((x) => x.id === params[0]);
      return (t as T) || null;
    }
    if (cleanSql.includes('COUNT(*) AS COUNT FROM GAME_RESULTS')) {
      return { count: this.gameResults.length } as T;
    }
    return null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const cleanSql = sql.trim().toUpperCase();
    if (cleanSql.includes('FROM GAME_RESULTS')) return this.gameResults as T[];
    if (cleanSql.includes('FROM REMINDERS')) return this.reminders as T[];
    if (cleanSql.includes('FROM DAILY_TASKS')) return this.tasks as T[];
    return [];
  }
}

let dbInstance: any = null;

export async function getDatabase(): Promise<any> {
  if (dbInstance) {
    return dbInstance;
  }

  if (Platform.OS === 'web') {
    dbInstance = new WebSQLiteDatabase();
    await seedDatabase(dbInstance);
    return dbInstance;
  }

  const nativeDb = await SQLite.openDatabaseAsync('yaad_patient.db');

  await nativeDb.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

  await nativeDb.execAsync(CREATE_TABLES_SQL);
  await seedDatabase(nativeDb as any);

  dbInstance = nativeDb;
  return dbInstance;
}

export async function resetDatabaseForDev(): Promise<void> {
  const db = await getDatabase();
  if (Platform.OS !== 'web') {
    await db.execAsync(`
      DROP TABLE IF EXISTS game_results;
      DROP TABLE IF EXISTS game_sessions;
      DROP TABLE IF EXISTS reminders;
      DROP TABLE IF EXISTS daily_tasks;
      DROP TABLE IF EXISTS connection_identity;
      DROP TABLE IF EXISTS voice_preferences;
      DROP TABLE IF EXISTS accessibility_preferences;
      DROP TABLE IF EXISTS patient_profile;
    `);
    await db.execAsync(CREATE_TABLES_SQL);
  }
  await seedDatabase(db);
}
