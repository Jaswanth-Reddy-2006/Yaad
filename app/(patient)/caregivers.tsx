import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, PhoneCall, ShieldCheck, UserPlus, UserCheck, Stethoscope, HeartPulse } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

interface CaregiverData {
  id: string;
  name: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  subtitle: string;
  phone: string;
  pastelBg: string;
  borderColor: string;
  callBtnBg: string;
  callTextColor: string;
  avatarBg: string;
  iconType: 'FAMILY' | 'NURSE' | 'DOCTOR';
}

const CAREGIVERS_DATA: CaregiverData[] = [
  {
    id: 'cg-1',
    name: 'Aarav Sharma',
    badgeText: 'PRIMARY',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    subtitle: 'Family Member',
    phone: '+91 98765 43210',
    pastelBg: '#E6F9ED',
    borderColor: '#86EFAC',
    callBtnBg: '#16A34A',
    callTextColor: '#16A34A',
    avatarBg: '#BBF7D0',
    iconType: 'FAMILY',
  },
  {
    id: 'cg-2',
    name: 'Priya Sharma',
    badgeText: 'SECONDARY',
    badgeBg: '#DBEAFE',
    badgeColor: '#1E40AF',
    subtitle: 'Nurse',
    phone: '+91 91234 56789',
    pastelBg: '#E8F2FF',
    borderColor: '#60A5FA',
    callBtnBg: '#2563EB',
    callTextColor: '#2563EB',
    avatarBg: '#BFDBFE',
    iconType: 'NURSE',
  },
  {
    id: 'cg-3',
    name: 'Dr. Rajesh Varma',
    badgeText: 'CLINICIAN',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9',
    subtitle: 'Doctor',
    phone: '+91 99887 76655',
    pastelBg: '#F5EFFE',
    borderColor: '#C084FC',
    callBtnBg: '#8B5CF6',
    callTextColor: '#8B5CF6',
    avatarBg: '#DDD6FE',
    iconType: 'DOCTOR',
  },
];

export default function YourCaregiversScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const handleCall = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`).catch(() => {});
  };

  const renderAvatarIcon = (type: 'FAMILY' | 'NURSE' | 'DOCTOR', color: string) => {
    if (type === 'NURSE') return <HeartPulse size={46} color={color} />;
    if (type === 'DOCTOR') return <Stethoscope size={46} color={color} />;
    return <UserCheck size={46} color={color} />;
  };

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header with Back Arrow Square Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel="Go Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={24} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('your_caregivers')}
        </Text>
      </View>

      {/* 3 Horizontal Cards Stacked Vertically (Matching media_1788281535251.png EXACTLY) */}
      <View style={styles.verticalStackContainer}>
        {CAREGIVERS_DATA.map((item) => (
          <View
            key={item.id}
            style={[
              styles.horizontalCaregiverCard,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : item.pastelBg,
                borderColor: item.borderColor,
              },
            ]}
          >
            {/* Left Portion: Large Avatar Circle */}
            <View style={[styles.avatarCircle, { backgroundColor: item.avatarBg }]}>
              {renderAvatarIcon(item.iconType, item.callBtnBg)}
            </View>

            {/* Middle Portion: Fixed Position Text Placeholder */}
            <View style={styles.textCenterPortion}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[styles.nameText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}
              >
                {item.name}
              </Text>

              {/* Badge Pill */}
              <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                {item.badgeText === 'PRIMARY' ? (
                  <ShieldCheck size={12} color={item.badgeColor} style={{ marginRight: 3 }} />
                ) : null}
                <Text style={[styles.badgeText, { color: item.badgeColor }]}>
                  {item.badgeText}
                </Text>
              </View>

              {/* Subtitle */}
              <Text style={styles.subtitleText}>
                {item.subtitle}
              </Text>
            </View>

            {/* Right Portion: Circular Call Button + Call Now Text Below */}
            <View style={styles.callRightPortion}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleCall(item.phone)}
                style={[styles.callCircleBtn, { backgroundColor: item.callBtnBg }]}
              >
                <PhoneCall size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.callNowText, { color: item.callTextColor }]}>
                {t('call_now')}
              </Text>
            </View>
          </View>
        ))}

        {/* Add New Caregiver Full-Width Green Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(patient)/connection')}
          style={styles.addNewCaregiverBtn}
        >
          <UserPlus size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.addNewCaregiverBtnText}>
            {t('connect_new_caregiver')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: SPACING.sm,
  },
  verticalStackContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  horizontalCaregiverCard: {
    width: '100%',
    flex: 1,
    minHeight: 110,
    maxHeight: 135,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenterPortion: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 19,
    fontWeight: '800',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 3,
  },
  callRightPortion: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  callCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  callNowText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  addNewCaregiverBtn: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xs,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addNewCaregiverBtnText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
