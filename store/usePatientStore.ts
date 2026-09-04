import { create } from 'zustand';
import { PatientProfile } from '../types';
import { patientRepository } from '../repositories/PatientRepository';

interface PatientState {
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await patientRepository.getProfile();
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load profile', isLoading: false });
    }
  },

  updateDisplayName: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await patientRepository.updateDisplayName(name);
      set({ profile: updated, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update name', isLoading: false });
    }
  },
}));
