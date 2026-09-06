import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import {
  PhoneCall,
  AlertTriangle,
  QrCode,
  HeartHandshake,
  Settings,
  ChevronRight,
  Languages,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function PatientHelpScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const handleCallCaregiver = () => {
    Linking.openURL('tel:+919876543210').catch(() => {});
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(() => {});
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header Row: Title & Settings Icon Shortcut */}
      <View style={styles.topHeaderRow}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          {t('help')}
        </Typography>

        <TouchableOpacity
          accessibilityLabel={t('open_settings')}
          accessibilityRole="button"
          onPress={() => router.push('/(patient)/settings')}
          style={styles.settingsCircleBtn}
        >
          <Settings size={22} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>
      </View>

      {/* 5 Vertical Cards */}
      <View style={styles.verticalStackContainer}>
        {/* Card 1: Your Caregivers */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/caregivers')}
          style={[
            styles.horizontalHelpCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#E6F9ED', borderColor: '#86EFAC' },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#16A34A' }]}>
            <HeartHandshake size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#15803D' }]}
            >
              {t('your_caregivers')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Call Caregiver */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCallCaregiver}
          style={[
            styles.horizontalHelpCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#E8F2FF', borderColor: '#60A5FA' },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#2563EB' }]}>
            <PhoneCall size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#1E40AF' }]}
            >
              {t('call_caregiver')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#1E40AF'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 3: Call Emergency (SOS) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCallEmergency}
          style={[
            styles.horizontalHelpCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FEE2E2', borderColor: '#FCA5A5' },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#DC2626' }]}>
            <AlertTriangle size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#991B1B' }]}
            >
              {t('call_emergency')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#991B1B'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 4: Connect with Caregiver */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/connection')}
          style={[
            styles.horizontalHelpCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#F3E8FF', borderColor: '#C084FC' },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#8B5CF6' }]}>
            <QrCode size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#6D28D9' }]}
            >
              {t('connection_qr')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 5: Testing Translation -> Navigates to dedicated page like Caregivers card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/testing-translation')}
          style={[
            styles.horizontalHelpCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FEF3C7', borderColor: '#FCD34D' },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#D97706' }]}>
            <Languages size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#B45309' }]}
            >
              Testing Translation
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#B45309'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  settingsCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  verticalStackContainer: {
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  horizontalHelpCard: {
    width: '100%',
    minHeight: 84,
    maxHeight: 105,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircleBadge: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenterPortion: {
    flex: 1,
    marginHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 19,
    fontWeight: '700',
  },
  rightChevronPortion: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
