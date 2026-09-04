import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

interface LangOption {
  id: string;
  nativeName: string;
  englishName: string;
  isDefault?: boolean;
}

const LANGUAGES: LangOption[] = [
  { id: 'en', nativeName: 'English', englishName: 'English', isDefault: true },
  { id: 'hi', nativeName: 'हिंदी', englishName: 'Hindi' },
  { id: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
  { id: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { id: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { id: 'bn', nativeName: 'বাংলা', englishName: 'Bengali' },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('en');
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          Choose Language
        </Typography>
        <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4, marginBottom: SPACING.lg }}>
          Select your preferred language
        </Typography>

        {/* Radio Cards List */}
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <TouchableOpacity
              key={lang.id}
              activeOpacity={0.8}
              onPress={() => setSelectedLang(lang.id)}
              style={[
                styles.langCard,
                isSelected ? styles.selectedCard : null,
                { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
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
                  {lang.englishName}
                </Typography>
              </View>

              {lang.isDefault ? (
                <View style={styles.defaultTag}>
                  <Typography size="xs" weight="bold" color={COLORS.primaryDark}>
                    Default
                  </Typography>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <Button
          title="Continue"
          variant="primary"
          onPress={() => router.push('/auth/role-select')}
          style={styles.continueBtn}
        />
      </ScrollView>
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
    paddingBottom: SPACING.xl,
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
    backgroundColor: '#DCFCE7',
  },
  defaultTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
  },
});
