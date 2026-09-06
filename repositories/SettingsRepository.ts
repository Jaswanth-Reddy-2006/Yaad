import { getDatabase } from '../database/db';
import { AccessibilityPreferences, VoicePreferences } from '../types';
import { LOCAL_PATIENT_ID } from '../database/seed';
import { LanguageCode } from '../constants/translations';

export interface ISettingsRepository {
  getAccessibilityPreferences(): Promise<AccessibilityPreferences>;
  updateAccessibilityPreferences(prefs: Partial<AccessibilityPreferences>): Promise<AccessibilityPreferences>;
  getVoicePreferences(): Promise<VoicePreferences>;
  updateVoicePreferences(prefs: Partial<VoicePreferences>): Promise<VoicePreferences>;
  getPreferredLanguage(): Promise<LanguageCode>;
  updatePreferredLanguage(lang: LanguageCode): Promise<LanguageCode>;
}

export class SQLiteSettingsRepository implements ISettingsRepository {
  async getAccessibilityPreferences(): Promise<AccessibilityPreferences> {
    const db: any = await getDatabase();
    const row = (await db.getFirstAsync(
      'SELECT * FROM accessibility_preferences WHERE patient_id = ?',
      [LOCAL_PATIENT_ID]
    )) as {
      text_size: string;
      high_contrast: number;
      easy_read: number;
    } | null;

    if (!row) {
      return { textSize: 'LARGE', highContrast: false, easyRead: true, elderMode: true };
    }

    return {
      textSize: row.text_size as any,
      highContrast: Boolean(row.high_contrast),
      easyRead: Boolean(row.easy_read),
      elderMode: true,
    };
  }

  async updateAccessibilityPreferences(prefs: Partial<AccessibilityPreferences>): Promise<AccessibilityPreferences> {
    const db: any = await getDatabase();
    const current = await this.getAccessibilityPreferences();
    const updated = { ...current, ...prefs };

    await db.runAsync(
      `UPDATE accessibility_preferences SET text_size = ?, high_contrast = ?, easy_read = ? WHERE patient_id = ?`,
      [updated.textSize, updated.highContrast ? 1 : 0, updated.easyRead ? 1 : 0, LOCAL_PATIENT_ID]
    );

    return updated;
  }

  async getVoicePreferences(): Promise<VoicePreferences> {
    const db: any = await getDatabase();
    const row = (await db.getFirstAsync(
      'SELECT * FROM voice_preferences WHERE patient_id = ?',
      [LOCAL_PATIENT_ID]
    )) as {
      enabled: number;
      speech_rate: number;
      pitch: number;
      language: string;
    } | null;

    if (!row) {
      return { enabled: true, speechRate: 0.85, pitch: 1.0, language: 'en-IN' };
    }

    return {
      enabled: Boolean(row.enabled),
      speechRate: row.speech_rate,
      pitch: row.pitch,
      language: row.language,
    };
  }

  async updateVoicePreferences(prefs: Partial<VoicePreferences>): Promise<VoicePreferences> {
    const db: any = await getDatabase();
    const current = await this.getVoicePreferences();
    const updated = { ...current, ...prefs };

    await db.runAsync(
      `UPDATE voice_preferences SET enabled = ?, speech_rate = ?, pitch = ?, language = ? WHERE patient_id = ?`,
      [updated.enabled ? 1 : 0, updated.speechRate, updated.pitch, updated.language, LOCAL_PATIENT_ID]
    );

    return updated;
  }

  async getPreferredLanguage(): Promise<LanguageCode> {
    const db: any = await getDatabase();
    const row = (await db.getFirstAsync(
      'SELECT preferred_language FROM patient_profile WHERE id = ?',
      [LOCAL_PATIENT_ID]
    )) as { preferred_language: string } | null;

    return (row?.preferred_language as LanguageCode) || 'en';
  }

  async updatePreferredLanguage(lang: LanguageCode): Promise<LanguageCode> {
    const db: any = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      'UPDATE patient_profile SET preferred_language = ?, updated_at = ? WHERE id = ?',
      [lang, now, LOCAL_PATIENT_ID]
    );

    return lang;
  }
}

export const settingsRepository = new SQLiteSettingsRepository();
