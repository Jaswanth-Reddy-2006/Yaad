import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineProximityPayload, RoutineScheduleItem, Reminder, PatientGameSchedule } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useReminderStore } from '../../store/useReminderStore';

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
};

export const DEFAULT_ROUTINE_SCHEDULE: RoutineScheduleItem[] = [
  { id: 'rot-1', patientId: 'p-1', title: 'Morning Medicine', time: '9:00 AM', category: 'MEDICINE', isCompleted: false, repeat: 'DAILY' },
  { id: 'rot-2', patientId: 'p-1', title: 'Drink Fresh Water', time: '10:30 AM', category: 'HYDRATION', isCompleted: false, repeat: 'DAILY' },
  { id: 'rot-3', patientId: 'p-1', title: 'Mind Sharp Game Session', time: '11:00 AM', category: 'ACTIVITY', isCompleted: false, repeat: 'DAILY' },
  { id: 'rot-4', patientId: 'p-1', title: 'Wholesome Lunch', time: '1:00 PM', category: 'MEAL', isCompleted: false, repeat: 'DAILY' },
  { id: 'rot-5', patientId: 'p-1', title: 'Evening Garden Walk', time: '5:30 PM', category: 'WALK', isCompleted: false, repeat: 'DAILY' },
  { id: 'rot-6', patientId: 'p-1', title: 'Night Medicine', time: '8:30 PM', category: 'MEDICINE', isCompleted: false, repeat: 'DAILY' },
];

export const DEFAULT_ONE_TIME_REMINDERS: Reminder[] = [
  {
    id: 'rem-hospital-1',
    patientId: 'p-1',
    title: 'Hospital Cardiology Checkup',
    description: 'Quarterly heart checkup with Dr. Rao at Apollo Hospital.',
    category: 'HOSPITAL',
    scheduledTime: '10:00 AM',
    scheduledDate: 'Upcoming Saturday',
    status: 'UPCOMING',
    repeat: 'ONCE',
    alarmEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-doc-2',
    patientId: 'p-1',
    title: 'Blood Pressure & Sugar Test',
    description: 'Fasting test collection at home.',
    category: 'DOCTOR',
    scheduledTime: '8:00 AM',
    scheduledDate: 'Next Monday',
    status: 'UPCOMING',
    repeat: 'ONCE',
    alarmEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_GAME_SCHEDULE: PatientGameSchedule = {
  patientId: 'p-1',
  playTimes: ['11:00 AM', '05:00 PM'],
  minimumPlaytimeMinutes: 10,
  playedMinutesToday: 0,
  isAlarmEnabled: true,
  lastPlayedDate: new Date().toISOString().split('T')[0],
};

class OfflineProximitySyncService {
  private readonly STORAGE_ROUTINE = 'yaad_offline_routine';
  private readonly STORAGE_REMINDERS = 'yaad_offline_reminders';
  private readonly STORAGE_GAME_SCHEDULE = 'yaad_offline_game_schedule';
  private readonly STORAGE_PLAYTIME = 'yaad_daily_playtime_seconds';

  /**
   * Generates a portable, offline JSON sync payload that can be transferred via QR code or local P2P.
   */
  public async generatePayload(patientId: string = 'p-1', caregiverId: string = 'cg-1'): Promise<string> {
    const routine = await this.getRoutineSchedule(patientId);
    const reminders = await this.getOneTimeReminders(patientId);
    const gameSchedule = await this.getGameSchedule(patientId);

    const payload: OfflineProximityPayload = {
      version: 1,
      patientId,
      caregiverId,
      generatedAt: new Date().toISOString(),
      routine,
      reminders,
      gameSchedule,
    };

    return JSON.stringify(payload);
  }

  /**
   * Ingests and merges an offline payload on the receiving device without internet.
   */
  public async ingestPayload(rawPayload: string): Promise<{ success: boolean; itemCount: number; message: string }> {
    try {
      if (!rawPayload || typeof rawPayload !== 'string') {
        throw new Error('Invalid payload string');
      }

      const parsed: OfflineProximityPayload = JSON.parse(rawPayload);
      if (!parsed || !parsed.routine || !parsed.reminders) {
        throw new Error('Payload format not recognized');
      }

      // Save routine tasks
      await safeStorage.setItem(this.STORAGE_ROUTINE, JSON.stringify(parsed.routine));
      // Save one-time reminders
      await safeStorage.setItem(this.STORAGE_REMINDERS, JSON.stringify(parsed.reminders));
      // Save game schedule
      if (parsed.gameSchedule) {
        await safeStorage.setItem(this.STORAGE_GAME_SCHEDULE, JSON.stringify(parsed.gameSchedule));
      }

      // Notify active stores
      try {
        useTaskStore.getState().loadTasks();
        useReminderStore.getState().loadReminders();
      } catch {}

      const totalItems = (parsed.routine?.length || 0) + (parsed.reminders?.length || 0);
      return {
        success: true,
        itemCount: totalItems,
        message: `Offline synchronization successful! Received ${parsed.routine.length} routine tasks and ${parsed.reminders.length} reminders.`,
      };
    } catch (err: any) {
      console.warn('[OfflineProximitySync] Ingestion failed:', err);
      return {
        success: false,
        itemCount: 0,
        message: err?.message || 'Failed to process offline sync payload.',
      };
    }
  }

  public async getRoutineSchedule(patientId: string = 'p-1'): Promise<RoutineScheduleItem[]> {
    try {
      const raw = await safeStorage.getItem(this.STORAGE_ROUTINE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ROUTINE_SCHEDULE;
  }

  public async saveRoutineSchedule(items: RoutineScheduleItem[]): Promise<void> {
    await safeStorage.setItem(this.STORAGE_ROUTINE, JSON.stringify(items));
    try {
      useTaskStore.getState().loadTasks();
    } catch {}
  }

  public async toggleRoutineItem(id: string): Promise<RoutineScheduleItem[]> {
    const list = await this.getRoutineSchedule();
    const updated = list.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    await this.saveRoutineSchedule(updated);
    return updated;
  }

  public async addRoutineItem(item: Omit<RoutineScheduleItem, 'id' | 'isCompleted'>): Promise<RoutineScheduleItem[]> {
    const list = await this.getRoutineSchedule();
    const newItem: RoutineScheduleItem = {
      ...item,
      id: `rot-${Date.now()}`,
      isCompleted: false,
      repeat: 'DAILY',
    };
    const updated = [...list, newItem];
    await this.saveRoutineSchedule(updated);
    return updated;
  }

  public async deleteRoutineItem(id: string): Promise<RoutineScheduleItem[]> {
    const list = await this.getRoutineSchedule();
    const updated = list.filter((item) => item.id !== id);
    await this.saveRoutineSchedule(updated);
    return updated;
  }

  public async getOneTimeReminders(patientId: string = 'p-1'): Promise<Reminder[]> {
    try {
      const raw = await safeStorage.getItem(this.STORAGE_REMINDERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ONE_TIME_REMINDERS;
  }

  public async saveOneTimeReminders(items: Reminder[]): Promise<void> {
    await safeStorage.setItem(this.STORAGE_REMINDERS, JSON.stringify(items));
    try {
      useReminderStore.getState().loadReminders();
    } catch {}
  }

  public async addOneTimeReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'status'>): Promise<Reminder[]> {
    const list = await this.getOneTimeReminders();
    const newRem: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      status: 'UPCOMING',
      repeat: reminder.repeat || 'ONCE',
      createdAt: new Date().toISOString(),
    };
    const updated = [...list, newRem];
    await this.saveOneTimeReminders(updated);
    return updated;
  }

  public async toggleReminderCompletion(id: string): Promise<Reminder[]> {
    const list = await this.getOneTimeReminders();
    const updated: Reminder[] = list.map((r) => {
      if (r.id === id) {
        const nextStatus = (r.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED') as Reminder['status'];
        return { ...r, status: nextStatus };
      }
      return r;
    });
    await this.saveOneTimeReminders(updated);
    return updated;
  }

  public async deleteReminder(id: string): Promise<Reminder[]> {
    const list = await this.getOneTimeReminders();
    const updated = list.filter((r) => r.id !== id);
    await this.saveOneTimeReminders(updated);
    return updated;
  }

  public async getGameSchedule(patientId: string = 'p-1'): Promise<PatientGameSchedule> {
    try {
      const raw = await safeStorage.getItem(this.STORAGE_GAME_SCHEDULE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.playTimes)) return parsed;
      }
    } catch {}
    return DEFAULT_GAME_SCHEDULE;
  }

  public async saveGameSchedule(schedule: PatientGameSchedule): Promise<void> {
    await safeStorage.setItem(this.STORAGE_GAME_SCHEDULE, JSON.stringify(schedule));
  }

  public async getPlaytimeSeconds(): Promise<number> {
    const todayKey = `${this.STORAGE_PLAYTIME}_${new Date().toISOString().split('T')[0]}`;
    const raw = await safeStorage.getItem(todayKey);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  public async addPlaytimeSeconds(seconds: number): Promise<number> {
    const todayKey = `${this.STORAGE_PLAYTIME}_${new Date().toISOString().split('T')[0]}`;
    const current = await this.getPlaytimeSeconds();
    const next = current + seconds;
    await safeStorage.setItem(todayKey, next.toString());
    return next;
  }
}

export const offlineProximitySync = new OfflineProximitySyncService();
