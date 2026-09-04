import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { UserRole } from '../types';

const ACCESS_TOKEN_KEY = 'mitracare_access_token';
const REFRESH_TOKEN_KEY = 'mitracare_refresh_token';
const USER_ROLE_KEY = 'mitracare_user_role';
const USER_ID_KEY = 'mitracare_user_id';

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {}
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {}
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: UserRole;
  displayName: string;
}

export class AuthService {
  private currentSession: AuthSession | null = null;

  public async getAccessToken(): Promise<string | null> {
    return await getItem(ACCESS_TOKEN_KEY);
  }

  public async getRefreshToken(): Promise<string | null> {
    return await getItem(REFRESH_TOKEN_KEY);
  }

  public async getUserRole(): Promise<UserRole | null> {
    const roleStr = await getItem(USER_ROLE_KEY);
    return roleStr as UserRole | null;
  }

  public async getUserId(): Promise<string | null> {
    if (this.currentSession?.userId) return this.currentSession.userId;
    return await getItem(USER_ID_KEY);
  }

  public async saveSession(session: AuthSession): Promise<void> {
    this.currentSession = session;
    await setItem(ACCESS_TOKEN_KEY, session.accessToken);
    await setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    await setItem(USER_ROLE_KEY, session.role);
    await setItem(USER_ID_KEY, session.userId);
  }

  public async clearSession(): Promise<void> {
    this.currentSession = null;
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
    await deleteItem(USER_ROLE_KEY);
    await deleteItem(USER_ID_KEY);
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const authService = new AuthService();
