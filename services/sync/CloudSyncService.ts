import { API_BASE_URL } from '../../constants/config';
import { authService } from '../AuthService';
import { offlineProximitySync } from './OfflineProximitySync';
import { Reminder } from '../../types';

export interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncedCount: number;
  error: string | null;
}

class CloudSyncService {
  private _status: CloudSyncStatus = {
    isSyncing: false,
    lastSyncedAt: null,
    syncedCount: 0,
    error: null,
  };

  private listeners: Array<(status: CloudSyncStatus) => void> = [];

  public getStatus(): CloudSyncStatus {
    return { ...this._status };
  }

  public subscribe(cb: (status: CloudSyncStatus) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getStatus()));
  }

  /**
   * Push local reminders, alarms, and voice notes to the cloud backend.
   */
  public async pushToCloud(patientId: string): Promise<boolean> {
    this._status.isSyncing = true;
    this._status.error = null;
    this.notify();

    try {
      const localReminders = await offlineProximitySync.getOneTimeReminders();
      const token = await authService.getAccessToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        patient_id: patientId,
        reminders: localReminders.map((r) => ({
          id: r.id,
          patient_id: r.patientId,
          title: r.title,
          description: r.description,
          category: r.category,
          scheduled_time: r.scheduledTime,
          status: r.status,
          repeat: r.repeat || 'DAILY',
          voice_note_url: r.voiceNoteUrl,
          voice_note_duration_sec: r.voiceNoteDurationSec,
          gentle_alarm_tone: r.gentleAlarmTone || 'CHIME',
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/sync/cloud/push`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      this._status.isSyncing = false;
      this._status.lastSyncedAt = new Date().toISOString();
      this._status.syncedCount = data.synced_count || localReminders.length;
      this.notify();
      return true;
    } catch (err: any) {
      this._status.isSyncing = false;
      this._status.error = err.message || 'Push sync failed';
      this.notify();
      return false;
    }
  }

  /**
   * Pull latest care plan, reminders, and voice notes from the cloud backend.
   */
  public async pullFromCloud(patientId: string): Promise<Reminder[]> {
    this._status.isSyncing = true;
    this._status.error = null;
    this.notify();

    try {
      const token = await authService.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/sync/cloud/pull?patient_id=${encodeURIComponent(patientId)}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const serverReminders: Reminder[] = (data.reminders || []).map((r: any) => ({
        id: r.id,
        patientId: r.patient_id,
        title: r.title,
        description: r.description,
        category: r.category,
        scheduledTime: r.scheduled_time,
        status: r.status,
        repeat: r.repeat || 'DAILY',
        voiceNoteUrl: r.voice_note_url,
        voiceNoteDurationSec: r.voice_note_duration_sec,
        gentleAlarmTone: r.gentle_alarm_tone || 'CHIME',
        createdAt: r.created_at,
      }));

      // Cache locally into OfflineProximitySync for full offline resilience
      if (serverReminders.length > 0) {
        for (const rem of serverReminders) {
          await offlineProximitySync.saveOrUpdateReminder(rem);
        }
      }

      this._status.isSyncing = false;
      this._status.lastSyncedAt = new Date().toISOString();
      this._status.syncedCount = serverReminders.length;
      this.notify();
      return serverReminders;
    } catch (err: any) {
      this._status.isSyncing = false;
      this._status.error = null;
      this.notify();
      // Gracefully return local cache on network error
      return offlineProximitySync.getOneTimeReminders(patientId);
    }
  }
}

export const cloudSyncService = new CloudSyncService();
