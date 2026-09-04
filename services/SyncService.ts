import { getDatabase } from '../database/db';
import { authService } from './AuthService';
import { API_BASE_URL } from '../constants/config';

export interface OfflineSyncEvent {
  eventId: string;
  type: 'GAME_RESULT' | 'REMINDER_COMPLETE' | 'PROFILE_UPDATE';
  payload: any;
  createdAt: string;
}

export class SyncService {
  private isSyncing = false;

  public async queueEvent(type: OfflineSyncEvent['type'], payload: any): Promise<void> {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const db: any = await getDatabase();
    
    try {
      await db.runAsync(
        'INSERT INTO offline_sync_queue (event_id, type, payload_json, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [eventId, type, JSON.stringify(payload), 'PENDING', new Date().toISOString()]
      );
    } catch {
      // Graceful fallback if sync queue table is initializing
    }
  }

  public async triggerSync(): Promise<{ processedCount: number }> {
    if (this.isSyncing) return { processedCount: 0 };
    this.isSyncing = true;

    try {
      const db: any = await getDatabase();
      const rows = (await db.getAllAsync(
        `SELECT event_id, type, payload_json FROM offline_sync_queue WHERE status = 'PENDING' LIMIT 50`
      )) as Array<{ event_id: string; type: string; payload_json: string }>;

      if (!rows || rows.length === 0) {
        return { processedCount: 0 };
      }

      const token = await authService.getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const items = rows.map((r) => ({
        event_id: r.event_id,
        type: r.type,
        payload: JSON.parse(r.payload_json),
      }));

      const res = await fetch(`${API_BASE_URL}/api/v1/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        return { processedCount: 0 };
      }

      const data = await res.json();
      const processedIds: string[] = data.processed_event_ids || [];

      for (const eventId of processedIds) {
        await db.runAsync(
          `UPDATE offline_sync_queue SET status = 'SYNCED', synced_at = ? WHERE event_id = ?`,
          [new Date().toISOString(), eventId]
        );
      }

      return { processedCount: processedIds.length };
    } catch (err) {
      return { processedCount: 0 };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
