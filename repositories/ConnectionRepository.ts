import { getDatabase } from '../database/db';
import { ConnectionIdentity } from '../types';
import { LOCAL_PATIENT_ID } from '../database/seed';

export interface IConnectionRepository {
  getConnectionIdentity(): Promise<ConnectionIdentity | null>;
}

export class SQLiteConnectionRepository implements IConnectionRepository {
  async getConnectionIdentity(): Promise<ConnectionIdentity | null> {
    const db: any = await getDatabase();
    const row = (await db.getFirstAsync(
      'SELECT * FROM connection_identity WHERE patient_id = ?',
      [LOCAL_PATIENT_ID]
    )) as {
      patient_id: string;
      connection_token: string;
      connection_code: string;
      qr_payload: string;
      created_at: string;
    } | null;

    if (!row) return null;

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
