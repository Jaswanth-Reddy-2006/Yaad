import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode } from '../../constants/translations';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, setLanguage, t } = useAccessibilityStore();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(currentLanguage || 'en');
  const isHc = preferences.highContrast;

  const handleSelectLang = (code: LanguageCode) => {
    setSelectedLang(code);
    setLanguage(code);
  };

  const handleContinue = () => {
    setLanguage(selectedLang);
    router.push('/auth/role-select');
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => {
            router.replace('/');
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          {t('choose_language')}
        </Typography>
        <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4, marginBottom: SPACING.md }}>
          {t('select_language')} ({INDIAN_LANGUAGES.length})
        </Typography>

        {/* Radio Cards List */}
        {INDIAN_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          const isDefault = lang.code === 'en';
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.8}
              onPress={() => handleSelectLang(lang.code)}
              style={[
                styles.langCard,
                isSelected ? styles.selectedCard : null,
                { backgroundColor: isHc ? (isSelected ? '#064E3B' : COLORS.hcCardBackground) : (isSelected ? '#DCFCE7' : '#FFFFFF') },
              ]}
            >
              {isSelected ? (
                <CheckCircle2 size={24} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
              ) : (
                <Circle size={24} color={COLORS.textMuted} style={{ marginRight: SPACING.md }} />
              )}

              <View style={{ flex: 1 }}>
                <Typography size="lg" weight="bold">
                  {lang.nativeName}
                </Typography>
                <Typography size="xs" color={COLORS.textMuted}>
                  {lang.name}
                </Typography>
              </View>

              {isDefault ? (
                <View style={styles.defaultTag}>
                  <Typography size="xs" weight="bold" color={COLORS.primaryDark}>
                    {t('default')}
                  </Typography>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Bar: Always visible without scrolling */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
            borderTopColor: isHc ? COLORS.hcBorder : '#E2E8F0',
          },
        ]}
      >
        <Button
          title={t('continue')}
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceVariant,
  },
  selectedCard: {
    borderColor: COLORS.primary,
  },
  defaultTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  bottomActionBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
  },
});
