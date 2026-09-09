import { ProximityDevice, ProximitySyncResult, ProximitySyncState } from '../../types';
import { offlineProximitySync } from './OfflineProximitySync';

type ProximityListener = (state: {
  status: ProximitySyncState;
  nearbyDevice: ProximityDevice | null;
  lastResult: ProximitySyncResult | null;
  progress: number;
}) => void;

class ProximitySyncService {
  private status: ProximitySyncState = 'IDLE';
  private nearbyDevice: ProximityDevice | null = null;
  private lastResult: ProximitySyncResult | null = null;
  private progress: number = 0;
  private listeners: Set<ProximityListener> = new Set();
  private scanTimer: any = null;

  constructor() {
    // Default nearby device placeholder when in range
    this.nearbyDevice = {
      id: 'patient-device-amma',
      name: "Amma's Phone",
      role: 'PATIENT',
      distanceMeters: 1.2,
      rssi: -48,
      status: 'IN_RANGE',
      lastSeen: 'Just now',
    };
  }

  public subscribe(listener: ProximityListener): () => void {
    this.listeners.add(listener);
    listener({
      status: this.status,
      nearbyDevice: this.nearbyDevice,
      lastResult: this.lastResult,
      progress: this.progress,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) =>
      l({
        status: this.status,
        nearbyDevice: this.nearbyDevice,
        lastResult: this.lastResult,
        progress: this.progress,
      })
    );
  }

  /**
   * Starts scanning for nearby Bluetooth / Local Proximity peers.
   */
  public startScanning(patientName: string = 'Amma') {
    if (this.status === 'SCANNING') return;
    this.status = 'SCANNING';
    this.progress = 0.2;
    this.notify();

    if (this.scanTimer) clearTimeout(this.scanTimer);

    // Emulate realistic Bluetooth beacon discovery in range (0.8s - 1.2s)
    this.scanTimer = setTimeout(() => {
      this.nearbyDevice = {
        id: `patient-device-${Date.now()}`,
        name: `${patientName}'s Phone`,
        role: 'PATIENT',
        distanceMeters: Number((0.8 + Math.random() * 0.8).toFixed(1)),
        rssi: Math.floor(-42 - Math.random() * 12),
        status: 'IN_RANGE',
        lastSeen: 'Just now',
      };
      this.status = 'DEVICE_FOUND';
      this.progress = 0.5;
      this.notify();
    }, 900);
  }

  public stopScanning() {
    if (this.scanTimer) clearTimeout(this.scanTimer);
    if (this.status === 'SCANNING') {
      this.status = 'IDLE';
      this.notify();
    }
  }

  /**
   * Performs a 1-tap wireless offline sync with the nearby device in range.
   * Transmits daily routine tasks, reminders, alarms, game schedules, and photos.
   */
  public async syncWithNearbyDevice(patientId: string = 'p-1', caregiverId: string = 'cg-1'): Promise<ProximitySyncResult> {
    this.status = 'SYNCING';
    this.progress = 0.6;
    this.notify();

    try {
      // Step 1: Generate complete offline package including photos & alarms
      const rawPayload = await offlineProximitySync.generatePayload(patientId, caregiverId);
      this.progress = 0.85;
      this.notify();

      // Brief transmission interval simulating local peer handshake
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 2: Ingest into local receiver storage
      const result = await offlineProximitySync.ingestPayload(rawPayload);
      this.lastResult = result;
      this.status = result.success ? 'SUCCESS' : 'ERROR';
      this.progress = 1.0;
      this.notify();

      return result;
    } catch (err: any) {
      const failResult: ProximitySyncResult = {
        success: false,
        itemCount: 0,
        syncedTasks: 0,
        syncedReminders: 0,
        syncedAlarms: 0,
        syncedFamilyPhotos: 0,
        syncedObjectPhotos: 0,
        message: err?.message || 'Proximity synchronization encountered an error.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      this.lastResult = failResult;
      this.status = 'ERROR';
      this.notify();
      return failResult;
    }
  }

  public reset() {
    this.status = 'IDLE';
    this.lastResult = null;
    this.progress = 0;
    this.notify();
  }

  public getNearbyDevice(): ProximityDevice | null {
    return this.nearbyDevice;
  }

  public getStatus(): ProximitySyncState {
    return this.status;
  }

  public getLastResult(): ProximitySyncResult | null {
    return this.lastResult;
  }
}

export const proximitySyncService = new ProximitySyncService();
