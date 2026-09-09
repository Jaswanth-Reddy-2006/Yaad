import { API_BASE_URL } from '../../../constants/config';

export interface ConnectivityOptions {
  timeoutMs?: number;
  customCheckUrl?: string;
  forceOnline?: boolean;
  forceOffline?: boolean;
}

let mockConnectivityStatus: boolean | null = null;

/**
 * Sets a mock connectivity status for testing purposes.
 */
export function setMockConnectivity(isOnline: boolean | null): void {
  mockConnectivityStatus = isOnline;
}

/**
 * Performs a fast, lightweight connectivity check.
 * Fails quickly and gracefully without crashing or throwing errors.
 */
export async function checkInternetConnection(options?: ConnectivityOptions): Promise<boolean> {
  if (options?.forceOffline) return false;
  if (options?.forceOnline) return true;
  if (mockConnectivityStatus !== null) return mockConnectivityStatus;

  const timeoutMs = options?.timeoutMs || 1500;
  const checkUrl = options?.customCheckUrl || `${API_BASE_URL}/health`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    // If backend /health probe fails, fallback to a secondary lightweight public check or return false
    try {
      const fallbackController = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackController.abort(), 1000);
      const fallbackRes = await fetch('https://1.1.1.1', {
        method: 'HEAD',
        signal: fallbackController.signal,
      });
      clearTimeout(fallbackTimer);
      return fallbackRes.status >= 200 && fallbackRes.status < 400;
    } catch {
      return false;
    }
  } finally {
    clearTimeout(timer);
  }
}
