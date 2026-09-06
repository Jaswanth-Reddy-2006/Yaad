import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  PhoneCall,
  AlertTriangle,
  QrCode,
  HeartHandshake,
  Settings,
  ChevronRight,
  Languages,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode, isRTLLanguage } from '../../constants/translations';
import { TranslationService } from '../../services/TranslationService';

const REGIONAL_LANGUAGES = INDIAN_LANGUAGES.filter((l) => l.code !== 'en');

export default function PatientHelpScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  // Feature 1: Regional Language -> English state
  const [selectedRegionalLang, setSelectedRegionalLang] = useState<LanguageCode>('hi');
  const [regionalInput, setRegionalInput] = useState('');
  const [showRegionalLangPicker, setShowRegionalLangPicker] = useState(false);
  const [regionalResult, setRegionalResult] = useState('');
  const [isTranslatingRegional, setIsTranslatingRegional] = useState(false);
  const [regionalError, setRegionalError] = useState<string | null>(null);

  // Feature 2: English -> Current App Language state
  const [selectedEnglishTargetLang, setSelectedEnglishTargetLang] = useState<LanguageCode>(
    currentLanguage !== 'en' ? currentLanguage : 'hi'
  );
  const [englishInput, setEnglishInput] = useState('');
  const [englishResult, setEnglishResult] = useState('');
  const [isTranslatingEnglish, setIsTranslatingEnglish] = useState(false);
  const [englishError, setEnglishError] = useState<string | null>(null);

  const handleCallCaregiver = () => {
    Linking.openURL('tel:+919876543210').catch(() => {});
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(() => {});
  };

  // Feature 1 Translation Handler
  const handleTranslateRegional = async () => {
    const textToTranslate = regionalInput.trim();
    if (!textToTranslate) {
      setRegionalResult('');
      setRegionalError(null);
      return;
    }

    setIsTranslatingRegional(true);
    setRegionalError(null);

    try {
      const translated = await TranslationService.translate(
        textToTranslate,
        selectedRegionalLang,
        'en'
      );
      setRegionalResult(translated);
    } catch (err: any) {
      setRegionalError(err?.message || 'Translation failed. Please try again.');
    } finally {
      setIsTranslatingRegional(false);
    }
  };

  // Feature 2 Translation Handler
  const handleTranslateEnglish = async () => {
    const textToTranslate = englishInput.trim();
    if (!textToTranslate) {
      setEnglishResult('');
      setEnglishError(null);
      return;
    }

    setIsTranslatingEnglish(true);
    setEnglishError(null);

    const targetLang = currentLanguage !== 'en' ? currentLanguage : selectedEnglishTargetLang;

    try {
      const translated = await TranslationService.translate(
        textToTranslate,
        'en',
        targetLang
      );
      setEnglishResult(translated);
    } catch (err: any) {
      setEnglishError(err?.message || 'Translation failed. Please try again.');
    } finally {
      setIsTranslatingEnglish(false);
    }
  };

  const selectedRegionalLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === selectedRegionalLang) || INDIAN_LANGUAGES[1];

  const currentAppLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  const targetLang = currentLanguage !== 'en' ? currentLanguage : selectedEnglishTargetLang;
  const targetLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === targetLang) || INDIAN_LANGUAGES[6];

  const isRegionalInputRtl = isRTLLanguage(selectedRegionalLang);
  const isFeature2TargetRtl = isRTLLanguage(targetLang);

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

      {/* 4 Vertical Cards with Fixed Text Portion & Auto-Scaling Single Line Text */}
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
          <View style={[styles.iconCircleBadge, { backgroundColor: '#DCFCE7' }]}>
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
      </View>

      {/* ========================================================================= */}
      {/* TRANSLATION SECTION (Offline IndicTrans2 AI Translation Engine)           */}
      {/* ========================================================================= */}
      <View style={styles.testSectionWrapper}>
        {/* Section Header */}
        <View style={styles.testSectionHeader}>
          <View style={styles.testHeaderIconBox}>
            <Languages size={24} color="#16A34A" />
          </View>
          <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
            <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {t('translation_test')}
            </Typography>
            <Typography size="xs" color={COLORS.textMuted}>
              {t('translation_test_desc')}
            </Typography>
          </View>
        </View>

        {/* FEATURE 1: Regional Language → English */}
        <View
          style={[
            styles.featureCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
          ]}
        >
          <View style={styles.featureTitleRow}>
            <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {t('regional_to_english')}
            </Typography>
          </View>

          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: SPACING.xs }}>
            {t('translation_input_lang')}
          </Typography>

          {/* Language Selector Dropdown Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowRegionalLangPicker(!showRegionalLangPicker)}
            style={[
              styles.langSelectorPill,
              { backgroundColor: isHc ? '#1F2937' : '#F8FAFC' },
            ]}
          >
            <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#1E40AF'}>
              {selectedRegionalLangInfo.name} — {selectedRegionalLangInfo.nativeName}
            </Typography>
            <ChevronDown size={20} color={isHc ? COLORS.hcTextPrimary : COLORS.textMuted} />
          </TouchableOpacity>

          {/* Dropdown Options List */}
          {showRegionalLangPicker && (
            <ScrollView style={styles.pickerScrollList} nestedScrollEnabled>
              {REGIONAL_LANGUAGES.map((lang) => {
                const isSelected = selectedRegionalLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedRegionalLang(lang.code);
                      setShowRegionalLangPicker(false);
                      setRegionalResult('');
                      setRegionalError(null);
                    }}
                    style={[
                      styles.pickerOptionItem,
                      isSelected ? styles.pickerOptionSelected : null,
                    ]}
                  >
                    <Typography
                      size="sm"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? '#16A34A' : '#0F172A'}
                    >
                      {lang.name} — {lang.nativeName}
                    </Typography>
                    {isSelected && <Check size={18} color="#16A34A" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Regional Text Input */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.md, marginBottom: 4 }}>
            {t('input_text')} ({selectedRegionalLangInfo.nativeName}):
          </Typography>

          {/* Quick Test Samples */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedRegionalLang('hi');
                setRegionalInput('मुझे सुबह आठ बजे अपनी दवा लेनी है।');
                setRegionalResult('');
                setRegionalError(null);
              }}
              style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#7DD3FC' }}
            >
              <Text style={{ fontSize: 12, color: '#0369A1', fontWeight: '700' }}>{t('sample_text')}: Hindi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedRegionalLang('te');
                setRegionalInput('నేను ఈరోజు డాక్టర్ వద్దకు వెళ్ళాలి.');
                setRegionalResult('');
                setRegionalError(null);
              }}
              style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#FCD34D' }}
            >
              <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '700' }}>{t('sample_text')}: Telugu</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={regionalInput}
            onChangeText={(text) => {
              setRegionalInput(text);
              if (regionalError) setRegionalError(null);
            }}
            placeholder={`Type text in ${selectedRegionalLangInfo.name}...`}
            placeholderTextColor={COLORS.textMuted}
            style={[
              styles.textInputField,
              {
                backgroundColor: isHc ? '#1E293B' : '#FAFAFC',
                color: isHc ? COLORS.hcTextPrimary : '#0F172A',
                textAlign: isRegionalInputRtl ? 'right' : 'left',
                writingDirection: isRegionalInputRtl ? 'rtl' : 'ltr',
              },
            ]}
          />

          {/* Translate Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isTranslatingRegional || !regionalInput.trim()}
            onPress={handleTranslateRegional}
            style={[
              styles.translateButton,
              {
                backgroundColor: isHc
                  ? COLORS.hcPrimary
                  : isTranslatingRegional || !regionalInput.trim()
                  ? '#CBD5E1'
                  : '#16A34A',
              },
            ]}
          >
            {isTranslatingRegional ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>{t('translating_offline')}</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>{t('translate_to_english')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {regionalError && (
            <View style={styles.errorContainer}>
              <Typography size="xs" weight="bold" color="#DC2626">
                {regionalError}
              </Typography>
            </View>
          )}

          {/* Translation Output Box */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.md, marginBottom: 4 }}>
            {t('english_translation')}
          </Typography>
          <View
            style={[
              styles.outputContainer,
              {
                backgroundColor: isHc
                  ? '#121212'
                  : regionalResult
                  ? '#DCFCE7'
                  : '#F1F5F9',
                borderColor: regionalResult ? '#86EFAC' : '#E2E8F0',
              },
            ]}
          >
            {regionalResult ? (
              <Typography
                size="base"
                weight="bold"
                color={isHc ? COLORS.hcPrimary : '#15803D'}
              >
                {regionalResult}
              </Typography>
            ) : (
              <Typography size="sm" color={COLORS.textMuted} style={{ fontStyle: 'italic' }}>
                {t('english_placeholder_result')}
              </Typography>
            )}
          </View>
        </View>

        {/* FEATURE 2: English → Current App Language */}
        <View
          style={[
            styles.featureCard,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF', marginTop: SPACING.md },
          ]}
        >
          <View style={styles.featureTitleRow}>
            <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {t('english_to_app_lang')}
            </Typography>
          </View>

          {/* Current App Language Badge Indicator */}
          <View style={styles.currentLangBadgeRow}>
            <Typography size="xs" weight="bold" color={COLORS.textMuted}>
              {t('current_app_lang')}{' '}
            </Typography>
            <View style={styles.appLangPill}>
              <Sparkles size={14} color="#7C3AED" style={{ marginRight: 4 }} />
              <Typography size="xs" weight="bold" color="#6D28D9">
                {currentAppLangInfo.name} ({currentAppLangInfo.nativeName})
              </Typography>
            </View>
          </View>

          {/* English Text Input */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.md, marginBottom: 4 }}>
            {t('input_text')} (English):
          </Typography>

          {/* Quick Test Samples */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedEnglishTargetLang('hi');
                setEnglishInput('Please take your blood pressure medication after breakfast.');
                setEnglishResult('');
                setEnglishError(null);
              }}
              style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#D8B4FE' }}
            >
              <Text style={{ fontSize: 12, color: '#6B21A8', fontWeight: '700' }}>{t('sample_text')}: Meds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedEnglishTargetLang('te');
                setEnglishInput('I have to go to the doctor today.');
                setEnglishResult('');
                setEnglishError(null);
              }}
              style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#6EE7B7' }}
            >
              <Text style={{ fontSize: 12, color: '#047857', fontWeight: '700' }}>{t('sample_text')}: Doctor</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={englishInput}
            onChangeText={(text) => {
              setEnglishInput(text);
              if (englishError) setEnglishError(null);
            }}
            placeholder={t('type_english_placeholder')}
            placeholderTextColor={COLORS.textMuted}
            style={[
              styles.textInputField,
              {
                backgroundColor: isHc ? '#1E293B' : '#FAFAFC',
                color: isHc ? COLORS.hcTextPrimary : '#0F172A',
                textAlign: 'left',
                writingDirection: 'ltr',
              },
            ]}
          />

          {/* Translate Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isTranslatingEnglish || !englishInput.trim()}
            onPress={handleTranslateEnglish}
            style={[
              styles.translateButton,
              {
                backgroundColor: isHc
                  ? COLORS.hcPrimary
                  : isTranslatingEnglish || !englishInput.trim()
                  ? '#CBD5E1'
                  : '#7C3AED',
              },
            ]}
          >
            {isTranslatingEnglish ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>{t('translating_offline')}</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {t('translate_to')} {targetLangInfo.name}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {englishError && (
            <View style={styles.errorContainer}>
              <Typography size="xs" weight="bold" color="#DC2626">
                {englishError}
              </Typography>
            </View>
          )}

          {/* Translation Output Box */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.md, marginBottom: 4 }}>
            {targetLangInfo.name} ({targetLangInfo.nativeName}) {t('translation_result_label')}:
          </Typography>
          <View
            style={[
              styles.outputContainer,
              {
                backgroundColor: isHc
                  ? '#121212'
                  : englishResult
                  ? '#EDE9FE'
                  : '#F1F5F9',
                borderColor: englishResult ? '#C084FC' : '#E2E8F0',
              },
            ]}
          >
            {englishResult ? (
              <Typography
                size="base"
                weight="bold"
                color={isHc ? COLORS.hcPrimary : '#6D28D9'}
                align={isFeature2TargetRtl ? 'right' : 'left'}
              >
                {englishResult}
              </Typography>
            ) : (
              <Typography size="sm" color={COLORS.textMuted} style={{ fontStyle: 'italic' }}>
                {t('translation_placeholder_result')}
              </Typography>
            )}
          </View>
        </View>
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
  testSectionWrapper: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
  },
  testSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  testHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  langSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  pickerScrollList: {
    maxHeight: 180,
    marginTop: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xs,
  },
  pickerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  pickerOptionSelected: {
    backgroundColor: '#DCFCE7',
  },
  textInputField: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 52,
  },
  translateButton: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.xs,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  outputContainer: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  currentLangBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  appLangPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#C084FC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
});
