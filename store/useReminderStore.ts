import { create } from 'zustand';
import { Reminder, ReminderStatus } from '../types';
import { reminderRepository } from '../repositories/ReminderRepository';

interface ReminderState {
  reminders: Reminder[];
  nextReminder: Reminder | null;
  isLoading: boolean;
  loadReminders: () => Promise<void>;
  markStatus: (id: string, status: ReminderStatus) => Promise<void>;
  snooze: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  nextReminder: null,
  isLoading: false,

  loadReminders: async () => {
    set({ isLoading: true });
    try {
      const list = await reminderRepository.getReminders();
      const next = await reminderRepository.getNextUpcomingReminder();
      set({ reminders: list, nextReminder: next, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markStatus: async (id, status) => {
    await reminderRepository.updateStatus(id, status);
    await get().loadReminders();
  },

  snooze: async (id) => {
    await reminderRepository.snoozeReminder(id);
    await get().loadReminders();
  },
}));
