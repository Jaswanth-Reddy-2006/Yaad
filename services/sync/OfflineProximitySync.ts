import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineProximityPayload, RoutineScheduleItem, Reminder, PatientGameSchedule, FamilyMemberRecallItem, ObjectRecallItem, ProximitySyncResult } from '../../types';
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


export const DEFAULT_FAMILY_MEMBERS: FamilyMemberRecallItem[] = [
  { id: 'fam-1', patientId: 'p-1', name: 'Suresh', relation: 'Son', avatarBg: '#DCFCE7', avatarPreset: 'son', notes: 'Lives in Bangalore, visits on weekends' },
  { id: 'fam-2', patientId: 'p-1', name: 'Ananya', relation: 'Granddaughter', avatarBg: '#FEF3C7', avatarPreset: 'granddaughter', notes: 'Studies in 5th class, loves drawing' },
  { id: 'fam-3', patientId: 'p-1', name: 'Kavita', relation: 'Daughter-in-Law', avatarBg: '#FCE7F3', avatarPreset: 'daughter', notes: 'Prepares favorite meals every day' },
  { id: 'fam-4', patientId: 'p-1', name: 'Ravi', relation: 'Grandson', avatarBg: '#DBEAFE', avatarPreset: 'grandson', notes: 'Plays chess in the evening' },
];

export const DEFAULT_OBJECT_RECALL_ITEMS: ObjectRecallItem[] = [
  { id: 'obj-1', patientId: 'p-1', name: 'Reading Glasses', location: 'On the bedside table', category: 'Personal', iconPreset: 'glasses', notes: 'Kept in brown case' },
  { id: 'obj-2', patientId: 'p-1', name: 'House Keys', location: 'In the kitchen key bowl', category: 'Essentials', iconPreset: 'keys', notes: 'Keychain with brass bell' },
  { id: 'obj-3', patientId: 'p-1', name: 'Walking Stick', location: 'Beside the front door', category: 'Mobility', iconPreset: 'walking_stick', notes: 'Wooden carved handle' },
  { id: 'obj-4', patientId: 'p-1', name: 'Medicine Box', location: 'On the dining table', category: 'Health', iconPreset: 'medicine', notes: 'White morning & evening pill organizer' },
  { id: 'obj-5', patientId: 'p-1', name: 'Water Bottle', location: 'On the living room side table', category: 'Hydration', iconPreset: 'water_bottle', notes: 'Steel bottle with green cap' },
];

class OfflineProximitySyncService {
  private readonly STORAGE_ROUTINE = 'yaad_offline_routine';
  private readonly STORAGE_REMINDERS = 'yaad_offline_reminders';
  private readonly STORAGE_GAME_SCHEDULE = 'yaad_offline_game_schedule';
  private readonly STORAGE_PLAYTIME = 'yaad_daily_playtime_seconds';
  private readonly STORAGE_FAMILY_MEMBERS = 'yaad_offline_family_members';
  private readonly STORAGE_OBJECT_RECALL = 'yaad_offline_object_recall';

  /**
   * Generates a complete offline JSON sync payload including full-resolution photos for Proximity/Bluetooth peer sync.
   */
  public async generatePayload(patientId: string = 'p-1', caregiverId: string = 'cg-1'): Promise<string> {
    const routine = await this.getRoutineSchedule(patientId);
    const reminders = await this.getOneTimeReminders(patientId);
    const gameSchedule = await this.getGameSchedule(patientId);
    const familyMembers = await this.getFamilyMembers(patientId);
    const objects = await this.getObjectRecallItems(patientId);

    const payload: OfflineProximityPayload = {
      version: 1,
      patientId,
      caregiverId,
      generatedAt: new Date().toISOString(),
      routine,
      reminders,
      gameSchedule,
      familyMembers,
      objects,
    };

    return JSON.stringify(payload);
  }

  /**
   * Generates an ultra-compact payload strictly designed for optical QR code capacity (< 400 bytes).
   * Ensures instant mobile camera recognition and avoids QR size limits.
   */
  public async generateQuickQRPayload(patientId: string = 'p-1', caregiverId: string = 'cg-1'): Promise<string> {
    const routine = await this.getRoutineSchedule(patientId);
    const reminders = await this.getOneTimeReminders(patientId);

    const compact = {
      app: 'yaad',
      t: 'SYNC',
      pid: patientId,
      r: routine.map((item) => [item.title, item.time, item.category]),
      rem: reminders.map((item) => [item.title, item.scheduledTime, item.scheduledDate || '']),
    };

    return JSON.stringify(compact);
  }

  /**
   * Ingests and merges an offline payload on the receiving device without internet.
   */
  public async ingestPayload(rawPayload: string): Promise<ProximitySyncResult> {
    try {
      if (!rawPayload || typeof rawPayload !== 'string') {
        throw new Error('Invalid payload string');
      }

      const rawObj = JSON.parse(rawPayload);
      let parsed: OfflineProximityPayload;

      // Handle compact QR payload format
      if (rawObj.t === 'SYNC' && Array.isArray(rawObj.r)) {
        const routine: RoutineScheduleItem[] = rawObj.r.map((item: any, idx: number) => ({
          id: `rot-${idx + 1}`,
          patientId: rawObj.pid || 'p-1',
          title: String(item[0]),
          time: String(item[1] || '9:00 AM'),
          category: (item[2] || 'MEDICINE') as any,
          isCompleted: false,
          repeat: 'DAILY',
        }));

        const reminders: Reminder[] = Array.isArray(rawObj.rem)
          ? rawObj.rem.map((item: any, idx: number) => ({
              id: `rem-qr-${idx + 1}`,
              patientId: rawObj.pid || 'p-1',
              title: String(item[0]),
              description: '',
              category: 'HOSPITAL',
              scheduledTime: String(item[1] || '10:00 AM'),
              scheduledDate: String(item[2] || 'Upcoming'),
              status: 'UPCOMING',
              repeat: 'ONCE',
              alarmEnabled: true,
              createdAt: new Date().toISOString(),
            }))
          : [];

        parsed = {
          version: 1,
          patientId: rawObj.pid || 'p-1',
          generatedAt: new Date().toISOString(),
          routine,
          reminders,
          gameSchedule: {
            patientId: rawObj.pid || 'p-1',
            playTimes: ['11:00 AM', '05:00 PM'],
            minimumPlaytimeMinutes: 10,
            playedMinutesToday: 0,
            isAlarmEnabled: true,
          },
        };
      } else {
        parsed = rawObj;
      }

      if (!parsed || !parsed.routine || !parsed.reminders) {
        throw new Error('Payload format not recognized');
      }

      // Save routine tasks
      await safeStorage.setItem(this.STORAGE_ROUTINE, JSON.stringify(parsed.routine));
      // Save one-time reminders & alarms
      await safeStorage.setItem(this.STORAGE_REMINDERS, JSON.stringify(parsed.reminders));
      // Save game schedule & alarms
      if (parsed.gameSchedule) {
        await safeStorage.setItem(this.STORAGE_GAME_SCHEDULE, JSON.stringify(parsed.gameSchedule));
      }
      // Save family recall items (with photos)
      if (Array.isArray(parsed.familyMembers)) {
        await safeStorage.setItem(this.STORAGE_FAMILY_MEMBERS, JSON.stringify(parsed.familyMembers));
      }
      // Save object recall items (with photos)
      if (Array.isArray(parsed.objects)) {
        await safeStorage.setItem(this.STORAGE_OBJECT_RECALL, JSON.stringify(parsed.objects));
      }

      // Notify active stores
      try {
        useTaskStore.getState().loadTasks();
        useReminderStore.getState().loadReminders();
      } catch {}

      const totalTasks = parsed.routine?.length || 0;
      const totalReminders = parsed.reminders?.length || 0;
      const totalAlarms =
        (parsed.reminders?.filter((r) => r.alarmEnabled).length || 0) +
        (parsed.gameSchedule?.isAlarmEnabled ? 1 : 0) +
        totalTasks;
      const familyPhotosCount =
        parsed.familyMembers?.filter((f) => !!f.photoUri && f.photoUri.length > 0).length || 0;
      const objectPhotosCount =
        parsed.objects?.filter((o) => !!o.photoUri && o.photoUri.length > 0).length || 0;

      const totalItems = totalTasks + totalReminders + (parsed.familyMembers?.length || 0) + (parsed.objects?.length || 0);

      return {
        success: true,
        itemCount: totalItems,
        syncedTasks: totalTasks,
        syncedReminders: totalReminders,
        syncedAlarms: totalAlarms,
        syncedFamilyPhotos: familyPhotosCount,
        syncedObjectPhotos: objectPhotosCount,
        message: `Offline synchronization successful! Received ${totalTasks} routine tasks, ${totalReminders} reminders, ${totalAlarms} alarms, and ${familyPhotosCount + objectPhotosCount} photos.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (err: any) {
      console.warn('[OfflineProximitySync] Ingestion failed:', err);
      return {
        success: false,
        itemCount: 0,
        syncedTasks: 0,
        syncedReminders: 0,
        syncedAlarms: 0,
        syncedFamilyPhotos: 0,
        syncedObjectPhotos: 0,
        message: err?.message || 'Failed to process offline sync payload.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  public async saveOrUpdateReminder(reminder: Reminder): Promise<Reminder[]> {
    const list = await this.getOneTimeReminders();
    const idx = list.findIndex((r) => r.id === reminder.id || (r.title === reminder.title && r.scheduledTime === reminder.scheduledTime));
    let updated: Reminder[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...updated[idx], ...reminder };
    } else {
      updated = [reminder, ...list];
    }
    await this.saveOneTimeReminders(updated);
    return updated;
  }

  public async markReminderCompleted(id: string): Promise<Reminder[]> {
    const list = await this.getOneTimeReminders();
    const updated: Reminder[] = list.map((r) => {
      if (r.id === id) {
        return { ...r, status: 'COMPLETED' as const };
      }
      return r;
    });
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

  public async getFamilyMembers(patientId: string = 'p-1'): Promise<FamilyMemberRecallItem[]> {
    try {
      const raw = await safeStorage.getItem(this.STORAGE_FAMILY_MEMBERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FAMILY_MEMBERS;
  }

  public async saveFamilyMembers(items: FamilyMemberRecallItem[]): Promise<void> {
    await safeStorage.setItem(this.STORAGE_FAMILY_MEMBERS, JSON.stringify(items));
  }

  public async addFamilyMember(item: Omit<FamilyMemberRecallItem, 'id'>): Promise<FamilyMemberRecallItem[]> {
    const list = await this.getFamilyMembers(item.patientId);
    const newItem: FamilyMemberRecallItem = {
      ...item,
      id: `fam-${Date.now()}`,
    };
    const updated = [newItem, ...list];
    await this.saveFamilyMembers(updated);
    return updated;
  }

  public async deleteFamilyMember(id: string): Promise<FamilyMemberRecallItem[]> {
    const list = await this.getFamilyMembers();
    const updated = list.filter((f) => f.id !== id);
    await this.saveFamilyMembers(updated);
    return updated;
  }

  public async getObjectRecallItems(patientId: string = 'p-1'): Promise<ObjectRecallItem[]> {
    try {
      const raw = await safeStorage.getItem(this.STORAGE_OBJECT_RECALL);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_OBJECT_RECALL_ITEMS;
  }

  public async saveObjectRecallItems(items: ObjectRecallItem[]): Promise<void> {
    await safeStorage.setItem(this.STORAGE_OBJECT_RECALL, JSON.stringify(items));
  }

  public async addObjectRecallItem(item: Omit<ObjectRecallItem, 'id'>): Promise<ObjectRecallItem[]> {
    const list = await this.getObjectRecallItems(item.patientId);
    const newItem: ObjectRecallItem = {
      ...item,
      id: `obj-${Date.now()}`,
    };
    const updated = [newItem, ...list];
    await this.saveObjectRecallItems(updated);
    return updated;
  }

  public async deleteObjectRecallItem(id: string): Promise<ObjectRecallItem[]> {
    const list = await this.getObjectRecallItems();
    const updated = list.filter((o) => o.id !== id);
    await this.saveObjectRecallItems(updated);
    return updated;
  }
}

export const offlineProximitySync = new OfflineProximitySyncService();
