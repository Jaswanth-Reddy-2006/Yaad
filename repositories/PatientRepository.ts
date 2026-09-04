import { getDatabase } from '../database/db';
import { PatientProfile } from '../types';
import { LOCAL_PATIENT_ID } from '../database/seed';

export interface IPatientRepository {
  getProfile(): Promise<PatientProfile | null>;
  updateDisplayName(name: string): Promise<PatientProfile>;
}

export class SQLitePatientRepository implements IPatientRepository {
  async getProfile(): Promise<PatientProfile | null> {
    const db: any = await getDatabase();
    const row = (await db.getFirstAsync(
      'SELECT * FROM patient_profile WHERE id = ?',
      [LOCAL_PATIENT_ID]
    )) as {
      id: string;
      display_name: string;
      age: number | null;
      preferred_language: string;
      timezone: string;
      created_at: string;
      updated_at: string;
    } | null;

    if (!row) return null;

    return {
      id: row.id,
      displayName: row.display_name,
      age: row.age ?? undefined,
      preferredLanguage: row.preferred_language,
      timezone: row.timezone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async updateDisplayName(name: string): Promise<PatientProfile> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE patient_profile SET display_name = ?, updated_at = ? WHERE id = ?',
      [name, now, LOCAL_PATIENT_ID]
    );
    const profile = await this.getProfile();
    if (!profile) throw new Error('Failed to update patient profile');
    return profile;
  }
}

export const patientRepository = new SQLitePatientRepository();
