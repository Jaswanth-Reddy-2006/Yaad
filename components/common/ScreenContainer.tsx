import React from 'react';
import { View, StyleSheet, ScrollView, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { BottomNavBar } from './BottomNavBar';

export interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean;
  showBottomNav?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  showBottomNav = true,
  style,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const bg = isHc ? COLORS.hcBackground : COLORS.background;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <View style={styles.contentWrapper}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.viewContent, style]} {...props}>
            {children}
          </View>
        )}
      </View>

      {showBottomNav ? <BottomNavBar /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },
  viewContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
});
