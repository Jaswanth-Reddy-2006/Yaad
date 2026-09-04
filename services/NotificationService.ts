import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

export class NotificationService {
  private hasPermission: boolean = false;

  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (Platform.OS === 'android' && this.hasPermission) {
        await Notifications.setNotificationChannelAsync('yaad-reminders', {
          name: 'Yaad Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E40AF',
        });
      }

      return this.hasPermission;
    } catch (err) {
      console.warn('[NotificationService] Permission check error:', err);
      return false;
    }
  }

  public async scheduleLocalReminder(
    id: string,
    title: string,
    body: string,
    secondsFromNow: number = 10
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const permitted = await this.requestPermission();
      if (!permitted) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { reminderId: id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(secondsFromNow, 5),
          repeats: false,
        },
      });

      return notificationId;
    } catch (err) {
      console.warn('[NotificationService] Failed to schedule notification:', err);
      return null;
    }
  }

  public async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('[NotificationService] Cancel error:', err);
    }
  }
}

export const notificationService = new NotificationService();
