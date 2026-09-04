import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from '../database/db';
import { usePatientStore } from '../store/usePatientStore';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { useVoiceStore } from '../store/useVoiceStore';
import { useReminderStore } from '../store/useReminderStore';
import { useTaskStore } from '../store/useTaskStore';
import { Typography } from '../components/common/Typography';
import { COLORS, SPACING } from '../constants/theme';

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  const loadProfile = usePatientStore((s) => s.loadProfile);
  const loadAccessibility = useAccessibilityStore((s) => s.loadPreferences);
  const loadVoice = useVoiceStore((s) => s.loadPreferences);
  const loadReminders = useReminderStore((s) => s.loadReminders);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    async function initApp() {
      try {
        await getDatabase();
        await Promise.all([
          loadProfile(),
          loadAccessibility(),
          loadVoice(),
          loadReminders(),
          loadTasks(),
        ]);
      } catch (err) {
        console.error('[RootLayout] Initialization error:', err);
      } finally {
        setIsDbReady(true);
      }
    }
    initApp();
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Typography size="lg" weight="medium" style={{ marginTop: SPACING.md }}>
          Setting up Yaad for you...
        </Typography>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
});
