import { getDatabase } from '../database/db';
import { ConnectionIdentity } from '../types';
import { LOCAL_PATIENT_ID, ensurePatientProfile } from '../database/seed';
import { authService } from '../services/AuthService';

export interface IConnectionRepository {
  getConnectionIdentity(): Promise<ConnectionIdentity | null>;
}

export class SQLiteConnectionRepository implements IConnectionRepository {
  private async resolvePatientId(): Promise<string> {
    const authId = await authService.getUserId();
    return authId || LOCAL_PATIENT_ID;
  }

  async getConnectionIdentity(): Promise<ConnectionIdentity | null> {
    const db: any = await getDatabase();
    const patientId = await this.resolvePatientId();
    await ensurePatientProfile(db, patientId);

    const row = (await db.getFirstAsync(
      'SELECT * FROM connection_identity WHERE patient_id = ?',
      [patientId]
    )) as {
      patient_id: string;
      connection_token: string;
      connection_code: string;
      qr_payload: string;
      created_at: string;
    } | null;

    if (!row) {
      // Fallback to LOCAL_PATIENT_ID connection identity if not found
      const fallbackRow = (await db.getFirstAsync(
        'SELECT * FROM connection_identity WHERE patient_id = ?',
        [LOCAL_PATIENT_ID]
      )) as {
        patient_id: string;
        connection_token: string;
        connection_code: string;
        qr_payload: string;
        created_at: string;
      } | null;

      if (!fallbackRow) return null;

      return {
        patientId: fallbackRow.patient_id,
        connectionToken: fallbackRow.connection_token,
        connectionCode: fallbackRow.connection_code,
        qrPayload: fallbackRow.qr_payload,
        createdAt: fallbackRow.created_at,
      };
    }

    return {
      patientId: row.patient_id,
      connectionToken: row.connection_token,
      connectionCode: row.connection_code,
      qrPayload: row.qr_payload,
      createdAt: row.created_at,
    };
  }
}

export const connectionRepository = new SQLiteConnectionRepository();
