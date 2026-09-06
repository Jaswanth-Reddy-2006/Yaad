import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, Moon, Globe, ChevronDown, Check, ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode } from '../../constants/translations';

export default function SettingsScreen() {
  const router = useRouter();
  const { preferences: accPrefs, currentLanguage, setLanguage, toggleHighContrast, t } = useAccessibilityStore();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const isHc = accPrefs.highContrast;
  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Header: Back Arrow on Left + Bold Settings Title */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft size={26} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginLeft: SPACING.sm }}>
          {t('settings')}
        </Typography>
      </View>

      {/* Cards Container matching media_1788281204076.png EXACTLY (ONLY 2 CARDS) */}
      <View style={styles.cardsContainer}>
        {/* Card 1: Light Mode / Dark Mode Toggle */}
        <View style={[styles.settingsCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <View style={[styles.iconCircleBadge, { backgroundColor: isHc ? '#1F2937' : '#FEF3C7' }]}>
            {isHc ? <Moon size={26} color={COLORS.hcPrimary} /> : <Sun size={26} color="#D97706" />}
          </View>

          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={styles.cardTitleText}>
            {isHc ? t('dark_mode') : t('light_mode')}
          </Typography>

          <Switch
            value={accPrefs.highContrast}
            onValueChange={toggleHighContrast}
            trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Card 2: Language Selector */}
        <View style={[styles.settingsCardStacked, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircleBadge, { backgroundColor: '#F3E8FF' }]}>
              <Globe size={26} color="#8B5CF6" />
            </View>

            <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={styles.cardTitleText}>
              {t('language')}
            </Typography>
          </View>

          {/* Active Language Dropdown Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowLangDropdown(!showLangDropdown)}
            style={styles.dropdownBox}
          >
            <Typography size="base" weight="semibold" color="#0F172A">
              {currentLangObj.nativeName} ({currentLangObj.name})
            </Typography>
            <ChevronDown size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {showLangDropdown ? (
            <ScrollView style={styles.dropdownScrollBox} nestedScrollEnabled>
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.8}
                    onPress={() => {
                      setLanguage(lang.code as LanguageCode);
                      setShowLangDropdown(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected ? styles.selectedOption : null,
                    ]}
                  >
                    <Typography size="base" weight={isSelected ? 'bold' : 'medium'}>
                      {lang.nativeName} ({lang.name})
                    </Typography>
                    {isSelected ? <Check size={20} color="#16A34A" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
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
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  settingsCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsCardStacked: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginTop: SPACING.md,
  },
  dropdownScrollBox: {
    maxHeight: 200,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: SPACING.xs,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  selectedOption: {
    backgroundColor: '#DCFCE7',
  },
});
