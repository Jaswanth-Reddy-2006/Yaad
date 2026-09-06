import { getDatabase } from '../../database/db';
import { LOCAL_PATIENT_ID } from '../../database/seed';
import { PatientContext } from './types';

export class PatientContextProvider {
  /**
   * Retrieves real patient context from the existing local SQLite database.
   * Completely offline, fail-safe, and never throws.
   */
  public static async getPatientContext(): Promise<PatientContext> {
    try {
      const db: any = await getDatabase();
      if (!db) {
        return {};
      }

      // 1. Fetch Patient Profile
      let patientName: string | undefined;
      try {
        const profile = (await db.getFirstAsync(
          'SELECT display_name FROM patient_profile WHERE id = ?',
          [LOCAL_PATIENT_ID]
        )) as { display_name: string } | null;

        if (profile?.display_name) {
          patientName = profile.display_name;
        }
      } catch (profileErr) {
        console.warn('[PatientContextProvider] Error reading patient profile:', profileErr);
      }

      // 2. Fetch Reminders (Medicine and Next Reminder)
      let medicineName: string | undefined;
      let medicineTime: string | undefined;
      let nextReminder: string | undefined;
      let nextReminderTime: string | undefined;

      try {
        const reminders = (await db.getAllAsync(
          'SELECT title, description, category, scheduled_time, status FROM reminders WHERE patient_id = ? ORDER BY id ASC',
          [LOCAL_PATIENT_ID]
        )) as Array<{
          title: string;
          description: string;
          category: string;
          scheduled_time: string;
          status: string;
        }>;

        if (Array.isArray(reminders) && reminders.length > 0) {
          // Find next upcoming medicine reminder, or fallback to the latest medicine reminder
          const upcomingMed = reminders.find(
            (r) => r.category === 'MEDICINE' && (r.status === 'UPCOMING' || r.status === 'DUE')
          );
          const anyMed = upcomingMed || reminders.find((r) => r.category === 'MEDICINE');

          if (anyMed) {
            medicineName = anyMed.title;
            medicineTime = anyMed.scheduled_time;
          }

          // Find the overall next upcoming reminder
          const upcomingRem = reminders.find(
            (r) => r.status === 'UPCOMING' || r.status === 'DUE'
          );
          if (upcomingRem) {
            nextReminder = upcomingRem.title;
            nextReminderTime = upcomingRem.scheduled_time;
          }
        }
      } catch (remindersErr) {
        console.warn('[PatientContextProvider] Error reading reminders:', remindersErr);
      }

      // 3. Fetch Daily Tasks for Today's Plan Summary & Activity
      let todayPlanSummary: string | undefined;
      let recommendedActivity: string | undefined;

      try {
        const tasks = (await db.getAllAsync(
          'SELECT title, category, is_completed FROM daily_tasks WHERE patient_id = ?',
          [LOCAL_PATIENT_ID]
        )) as Array<{
          title: string;
          category: string;
          is_completed: number;
        }>;

        if (Array.isArray(tasks) && tasks.length > 0) {
          const pendingTasks = tasks.filter((t) => !t.is_completed);
          if (pendingTasks.length > 0) {
            todayPlanSummary = pendingTasks.map((t) => t.title).slice(0, 2).join(' and ');
          }

          const activityTask = tasks.find((t) => t.category === 'ACTIVITY');
          if (activityTask) {
            recommendedActivity = activityTask.title;
          }
        }
      } catch (tasksErr) {
        console.warn('[PatientContextProvider] Error reading daily tasks:', tasksErr);
      }

      return {
        patientName,
        medicineName,
        medicineTime,
        nextReminder,
        nextReminderTime,
        todayPlanSummary,
        recommendedActivity,
      };
    } catch (err) {
      console.warn('[PatientContextProvider] Database error while fetching context:', err);
      return {};
    }
  }
}
