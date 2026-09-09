import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Brain } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface CaregiverTopHeaderProps {
  showBack?: boolean;
  onBackPress?: () => void;
  title?: string;
  rightAction?: React.ReactNode;
}

export const CaregiverTopHeader: React.FC<CaregiverTopHeaderProps> = ({
  showBack = false,
  onBackPress,
  title,
  rightAction,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftArea}>
        {showBack ? (
          <TouchableOpacity
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
        ) : null}

        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrapper}>
              <Brain size={18} color="#16A34A" />
            </View>
            <Text style={styles.brandText}>YAAD</Text>
          </View>
        )}
      </View>

      <View style={styles.rightArea}>
        {rightAction ? rightAction : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    backgroundColor: '#F7FAF8',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F0',
  },
  leftArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});
