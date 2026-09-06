import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Check, Sparkles } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode, isRTLLanguage } from '../../constants/translations';
import { TranslationService } from '../../services/TranslationService';

const REGIONAL_LANGUAGES = INDIAN_LANGUAGES.filter((l) => l.code !== 'en');

export default function TestingTranslationScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  // Active translation tab mode: 'REGIONAL_TO_EN' | 'EN_TO_REGIONAL'
  const [activeTab, setActiveTab] = useState<'REGIONAL_TO_EN' | 'EN_TO_REGIONAL'>('REGIONAL_TO_EN');

  // Mode 1: Regional Language -> English state
  const [selectedRegionalLang, setSelectedRegionalLang] = useState<LanguageCode>('hi');
  const [regionalInput, setRegionalInput] = useState('');
  const [showRegionalLangPicker, setShowRegionalLangPicker] = useState(false);
  const [regionalResult, setRegionalResult] = useState('');
  const [isTranslatingRegional, setIsTranslatingRegional] = useState(false);

  // Mode 2: English -> Target Indian Language state
  const [selectedEnglishTargetLang, setSelectedEnglishTargetLang] = useState<LanguageCode>(
    currentLanguage !== 'en' ? currentLanguage : 'hi'
  );
  const [showEnglishTargetLangPicker, setShowEnglishTargetLangPicker] = useState(false);
  const [englishInput, setEnglishInput] = useState('');
  const [englishResult, setEnglishResult] = useState('');
  const [isTranslatingEnglish, setIsTranslatingEnglish] = useState(false);

  // Mode 1 Translation Handler
  const handleTranslateRegional = async () => {
    const textToTranslate = regionalInput.trim();
    if (!textToTranslate) {
      setRegionalResult('');
      return;
    }

    setIsTranslatingRegional(true);
    try {
      const translated = await TranslationService.translate(
        textToTranslate,
        selectedRegionalLang,
        'en'
      );
      setRegionalResult(translated);
    } catch {
      setRegionalResult('Translation failed.');
    } finally {
      setIsTranslatingRegional(false);
    }
  };

  // Mode 2 Translation Handler
  const handleTranslateEnglish = async () => {
    const textToTranslate = englishInput.trim();
    if (!textToTranslate) {
      setEnglishResult('');
      return;
    }

    setIsTranslatingEnglish(true);
    try {
      const translated = await TranslationService.translate(
        textToTranslate,
        'en',
        selectedEnglishTargetLang
      );
      setEnglishResult(translated);
    } catch {
      setEnglishResult('Translation failed.');
    } finally {
      setIsTranslatingEnglish(false);
    }
  };

  const selectedRegionalLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === selectedRegionalLang) || INDIAN_LANGUAGES[1];

  const targetLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === selectedEnglishTargetLang) || INDIAN_LANGUAGES[6];

  const isRegionalInputRtl = isRTLLanguage(selectedRegionalLang);
  const isFeature2TargetRtl = isRTLLanguage(selectedEnglishTargetLang);

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header with Back Arrow */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={24} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('translation_test')}
        </Text>
      </View>

      {/* Mode Switcher Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('REGIONAL_TO_EN')}
          style={[
            styles.tabButton,
            activeTab === 'REGIONAL_TO_EN' ? styles.tabButtonActiveGreen : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'REGIONAL_TO_EN' ? styles.tabButtonTextActive : null,
            ]}
          >
            {t('regional_to_english')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('EN_TO_REGIONAL')}
          style={[
            styles.tabButton,
            activeTab === 'EN_TO_REGIONAL' ? styles.tabButtonActivePurple : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'EN_TO_REGIONAL' ? styles.tabButtonTextActive : null,
            ]}
          >
            {t('english_to_regional')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODE 1: Regional Language → English */}
      {activeTab === 'REGIONAL_TO_EN' && (
        <View style={styles.cardContent}>
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

          {/* Input Text Box */}
          <TextInput
            value={regionalInput}
            onChangeText={setRegionalInput}
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
                <Text style={styles.btnText}>{t('translating')}</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>{t('translate_to_english')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Output Box */}
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
                {t('translation_placeholder_result')}
              </Typography>
            )}
          </View>
        </View>
      )}

      {/* MODE 2: English → Target Indian Language */}
      {activeTab === 'EN_TO_REGIONAL' && (
        <View style={styles.cardContent}>
          {/* Target Language Selector Dropdown Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowEnglishTargetLangPicker(!showEnglishTargetLangPicker)}
            style={[
              styles.langSelectorPill,
              { backgroundColor: isHc ? '#1F2937' : '#F8FAFC', borderColor: '#C084FC' },
            ]}
          >
            <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#6D28D9'}>
              {targetLangInfo.name} — {targetLangInfo.nativeName}
            </Typography>
            <ChevronDown size={20} color={isHc ? COLORS.hcTextPrimary : COLORS.textMuted} />
          </TouchableOpacity>

          {/* Dropdown Options List */}
          {showEnglishTargetLangPicker && (
            <ScrollView style={styles.pickerScrollList} nestedScrollEnabled>
              {REGIONAL_LANGUAGES.map((lang) => {
                const isSelected = selectedEnglishTargetLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedEnglishTargetLang(lang.code);
                      setShowEnglishTargetLangPicker(false);
                      setEnglishResult('');
                    }}
                    style={[
                      styles.pickerOptionItem,
                      isSelected ? { backgroundColor: '#EDE9FE' } : null,
                    ]}
                  >
                    <Typography
                      size="sm"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? '#6D28D9' : '#0F172A'}
                    >
                      {lang.name} — {lang.nativeName}
                    </Typography>
                    {isSelected && <Check size={18} color="#6D28D9" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Input Text Box */}
          <TextInput
            value={englishInput}
            onChangeText={setEnglishInput}
            placeholder="Type English text..."
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
                <Text style={styles.btnText}>{t('translating')}</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {t('translate_to')} {targetLangInfo.nativeName || targetLangInfo.name}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Output Box */}
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
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xxl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    padding: 4,
    marginVertical: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  tabButtonActiveGreen: {
    backgroundColor: '#16A34A',
  },
  tabButtonActivePurple: {
    backgroundColor: '#7C3AED',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardContent: {
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  langSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  pickerScrollList: {
    maxHeight: 200,
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
    paddingVertical: 12,
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
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 56,
  },
  translateButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: '700',
  },
  outputContainer: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
});
