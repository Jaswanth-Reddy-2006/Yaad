import { create } from 'zustand';
import { DailyTask } from '../types';
import { dailyTaskRepository } from '../repositories/DailyTaskRepository';

interface TaskState {
  tasks: DailyTask[];
  progress: { completed: number; total: number };
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  progress: { completed: 0, total: 0 },
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const list = await dailyTaskRepository.getDailyTasks();
      const prog = await dailyTaskRepository.getDailyProgress();
      set({ tasks: list, progress: prog, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleTask: async (id) => {
    await dailyTaskRepository.toggleTaskCompletion(id);
    await get().loadTasks();
  },
}));
