import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface ConnectedPatient {
  id: string;
  name: string;
  activityStatus: string;
  status: string;
  activitiesDone: string;
  mood: string;
  lastActive: string;
  avatarBg: string;
  connectionCode?: string;
  relationshipType?: string;
}

export interface CaregiverReminder {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  category: 'MEDICINE' | 'HYDRATION' | 'ACTIVITY' | 'APPOINTMENT' | 'ROUTINE' | 'OTHER';
  scheduledTime: string;
  status: 'UPCOMING' | 'DUE' | 'COMPLETED' | 'MISSED' | 'SKIPPED';
  repeat: 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  completedAt?: string;
}

export interface CaregiverAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: 'MISSED_REMINDER' | 'REPEATED_MISSED_REMINDER' | 'LOW_ACTIVITY' | 'ACTIVITY_TREND_CHANGE' | 'PATIENT_SOS' | 'SYSTEM_ALERT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  whyItMatters?: string;
  suggestedAction?: string;
  timestamp: string;
  isResolved: boolean;
}

interface CaregiverState {
  caregiverName: string;
  activePatientId: string;
  patients: ConnectedPatient[];
  reminders: CaregiverReminder[];
  alerts: CaregiverAlert[];
  isLoading: boolean;
  isOfflineMode: boolean;
  lastSyncedTime: string | null;
  error: string | null;

  setActivePatientId: (patientId: string) => void;
  getActivePatient: () => ConnectedPatient | undefined;
  fetchDashboardData: (token?: string) => Promise<void>;
  connectPatient: (codeOrQr: string, name: string, relationship: string, token?: string) => Promise<boolean>;
  addReminder: (reminder: Omit<CaregiverReminder, 'id' | 'status'>, token?: string) => Promise<void>;
  toggleReminderStatus: (id: string, status: CaregiverReminder['status'], token?: string) => Promise<void>;
  resolveAlert: (alertId: string, token?: string) => Promise<void>;
}

export const useCaregiverStore = create<CaregiverState>((set, get) => ({
  caregiverName: 'Caregiver',
  activePatientId: '',
  patients: [],
  reminders: [],
  alerts: [],
  isLoading: false,
  isOfflineMode: false,
  lastSyncedTime: null,
  error: null,

  setActivePatientId: (patientId) => {
    set({ activePatientId: patientId });
  },

  getActivePatient: () => {
    const { patients, activePatientId } = get();
    if (!patients || patients.length === 0) return undefined;
    return patients.find((p) => p.id === activePatientId) || patients[0];
  },

  fetchDashboardData: async (token) => {
    set({ isLoading: true, error: null });

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/caregiver/dashboard', { headers });

      if (res.ok) {
        const data = await res.json();

        // Fetch live connected patients list from database
        const pRes = await fetch('http://localhost:8000/api/v1/caregiver/patients', { headers });
        let livePatients: ConnectedPatient[] = [];
        if (pRes.ok) {
          const pData = await pRes.json();
          if (Array.isArray(pData)) {
            livePatients = pData.map((item: any) => ({
              id: item.patient_id,
              name: item.name,
              activityStatus: item.activity_status,
              status: item.status,
              activitiesDone: item.activities_done,
              mood: (item.mood || 'Good').replace(/[^\w\s]/gi, '').trim(),
              lastActive: item.last_active,
              avatarBg: item.avatar_bg || '#FEF3C7'
            }));
          }
        }

        // Fetch live alerts list from database
        const aRes = await fetch('http://localhost:8000/api/v1/caregiver/alerts', { headers });
        let liveAlerts: CaregiverAlert[] = [];
        if (aRes.ok) {
          const aData = await aRes.json();
          if (Array.isArray(aData)) {
            liveAlerts = aData.map((alt: any) => ({
              id: alt.id,
              patientId: alt.patient_id,
              patientName: 'Connected Patient',
              alertType: alt.alert_type,
              severity: alt.severity,
              title: alt.title,
              message: alt.message,
              whyItMatters: alt.why_it_matters,
              suggestedAction: alt.suggested_action,
              timestamp: alt.created_at ? new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              isResolved: alt.is_resolved
            }));
          }
        }

        const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => {
          const currentActiveId = state.activePatientId && livePatients.some(p => p.id === state.activePatientId)
            ? state.activePatientId
            : livePatients[0] ? livePatients[0].id : '';

          return {
            caregiverName: data.caregiver_name || 'Caregiver',
            patients: livePatients,
            alerts: liveAlerts,
            activePatientId: currentActiveId,
            isOfflineMode: false,
            lastSyncedTime: syncTime,
            isLoading: false
          };
        });

        try {
          await safeStorage.setItem('mitracare_caregiver_patients', JSON.stringify(livePatients));
          await safeStorage.setItem('mitracare_last_synced', syncTime);
        } catch (e) {}

        return;
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      const cachedPatients = await safeStorage.getItem('mitracare_caregiver_patients');
      const cachedTime = await safeStorage.getItem('mitracare_last_synced');
      if (cachedPatients) {
        const parsed = JSON.parse(cachedPatients);
        set((state) => ({
          patients: parsed,
          activePatientId: state.activePatientId || (parsed[0] ? parsed[0].id : ''),
          isOfflineMode: true,
          lastSyncedTime: cachedTime || 'Offline',
          isLoading: false
        }));
        return;
      }
    } catch (e) {}

    set({ isOfflineMode: true, isLoading: false });
  },

  connectPatient: async (codeOrQr, name, relationship, token) => {
    set({ isLoading: true, error: null });

    let targetCode = codeOrQr.trim().toUpperCase();

    if (codeOrQr.startsWith('{')) {
      try {
        const parsed = JSON.parse(codeOrQr);
        if (parsed.code) targetCode = parsed.code.toUpperCase();
        if (parsed.patientName && !name) name = parsed.patientName;
      } catch (e) {}
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/v1/caregiver/connect', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          connection_code_or_token: targetCode,
          relationship_type: relationship || 'Family Member'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newPatient: ConnectedPatient = {
          id: data.patient_id,
          name: data.patient_name || name || 'Connected Patient',
          activityStatus: 'Activity: Active',
          status: 'Connected',
          activitiesDone: '0/6',
          mood: 'Good',
          lastActive: 'Just now',
          avatarBg: '#DCFCE7',
          connectionCode: targetCode,
          relationshipType: relationship || 'Family Member'
        };

        set((state) => ({
          patients: [newPatient, ...state.patients],
          activePatientId: newPatient.id, // Auto-select newly connected patient
          isLoading: false
        }));

        return true;
      }
    } catch (err) {
      // API error or offline fallback
    }

    set({ isLoading: false });
    return false;
  },

  addReminder: async (reminderData, token) => {
    const newRem: CaregiverReminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
      status: 'UPCOMING'
    };

    set((state) => ({
      reminders: [newRem, ...state.reminders]
    }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`http://localhost:8000/api/v1/caregiver/patients/${reminderData.patientId}/reminders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: reminderData.title,
          description: reminderData.description || '',
          category: reminderData.category,
          scheduled_time: reminderData.scheduledTime,
          repeat: reminderData.repeat || 'DAILY'
        })
      });
    } catch (e) {}
  },

  toggleReminderStatus: async (id, newStatus, token) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              completedAt: newStatus === 'COMPLETED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : r.completedAt
            }
          : r
      )
    }));
  },

  resolveAlert: async (alertId, token) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, isResolved: true } : a))
    }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`http://localhost:8000/api/v1/caregiver/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers
      });
    } catch (e) {}
  }
}));
