import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Mic,
  Square,
  Volume2,
  ChevronDown,
  Check,
  Cpu,
  Wifi,
  WifiOff,
  Info,
  CheckCircle,
  HelpCircle,
  VolumeX,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import {
  ALL_VOICE_LANGUAGES,
  resolveVoiceLanguage,
  VoiceLanguageConfig,
  TTSAvailability,
  STTAvailability,
  STTMode,
  voiceService,
  sttManager,
} from '../../services/VoiceService';

export default function VoiceTestScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  // Active Tab Mode: 'STT' (Speech to Text) | 'TTS' (Text to Speech)
  const [activeTab, setActiveTab] = useState<'STT' | 'TTS'>('STT');

  // Selected language state
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('hi');
  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);

  // TTS State
  const [ttsInputText, setTtsInputText] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // STT State
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSTTMode, setActiveSTTMode] = useState<STTMode>('online');
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  // Availability state
  const [statusMessage, setStatusMessage] = useState<string>('Ready for testing');
  const [voiceAvailability, setVoiceAvailability] = useState<TTSAvailability | null>(null);
  const [sttAvailability, setSttAvailability] = useState<STTAvailability | null>(null);

  const selectedLangObj: VoiceLanguageConfig = resolveVoiceLanguage(selectedLanguageId);

  useEffect(() => {
    let isMounted = true;
    async function checkAvailability() {
      const ttsRes = await voiceService.checkVoiceAvailability(selectedLangObj.id);
      const sttRes = await voiceService.getSTTLanguageAvailability(selectedLangObj.id, {
        preferredMode: simulatedOffline ? 'offline' : 'auto',
      });
      if (isMounted) {
        setVoiceAvailability(ttsRes);
        setSttAvailability(sttRes);
      }
    }
    checkAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedLanguageId, simulatedOffline]);

  useEffect(() => {
    return () => {
      voiceService.destroy();
    };
  }, []);

  const toggleSimulatedOffline = () => {
    const nextVal = !simulatedOffline;
    setSimulatedOffline(nextVal);
    sttManager.setSimulatedOffline(nextVal);
    setStatusMessage(
      nextVal
        ? 'Internet OFF simulated: STT will route strictly to on-device Local Offline ASR.'
        : 'Internet ON restored: STT will automatically use Online Recognition.'
    );
  };

  // TTS Handler
  const handleSpeak = async () => {
    const textToSpeak = ttsInputText.trim();
    if (!textToSpeak) {
      setStatusMessage('Please enter text to speak out loud.');
      return;
    }

    const engineLabel =
      voiceAvailability?.engineType === 'LOCAL_ONNX_MODEL'
        ? 'Local Offline Model'
        : 'Device Voice Engine';

    setIsSynthesizing(true);
    setStatusMessage(`Synthesizing (${engineLabel}) in ${selectedLangObj.displayName}...`);

    await voiceService.speak(textToSpeak, selectedLangObj.id, {
      onStart: () => {
        setIsSynthesizing(true);
        setStatusMessage(`Speaking (${engineLabel}) in ${selectedLangObj.displayName}...`);
      },
      onDone: () => {
        setIsSynthesizing(false);
        setStatusMessage('Finished speaking successfully.');
      },
      onError: (err) => {
        setIsSynthesizing(false);
        setStatusMessage(err || 'Failed to synthesize text.');
      },
    });
  };

  // STT Handlers
  const startSTT = async () => {
    if (isListening) return;
    const modeLabel = simulatedOffline ? 'Offline Local ASR' : 'Auto Online/Offline';
    setRecognizedText('');
    setStatusMessage(`Listening for ${selectedLangObj.displayName} [${modeLabel}]... Speak freely.`);
    setIsListening(true);

    let sessionHasResult = false;

    await voiceService.startListening(
      selectedLangObj.id,
      {
        onResult: (transcript, isFinal, resultInfo) => {
          if (resultInfo?.mode) {
            setActiveSTTMode(resultInfo.mode);
          }
          if (transcript && transcript.trim().length > 0) {
            sessionHasResult = true;
            setRecognizedText(transcript.trim());
            const modeTag = resultInfo?.mode === 'offline' ? ' [OFFLINE ASR]' : ' [ONLINE STT]';
            if (isFinal) {
              setStatusMessage(`Speech recognized successfully${modeTag}.`);
            } else {
              setStatusMessage(`Listening in ${selectedLangObj.displayName}${modeTag}...`);
            }
          }
        },
        onError: (error) => {
          setStatusMessage(error);
          setIsListening(false);
        },
        onStateChange: (listening) => {
          setIsListening(listening);
          if (!listening) {
            if (!sessionHasResult) {
              setStatusMessage('No speech detected. Please try again.');
            } else {
              setStatusMessage('Speech recognition completed.');
            }
          }
        },
        onModeChange: (mode) => {
          setActiveSTTMode(mode);
        },
      },
      {
        preferredMode: simulatedOffline ? 'offline' : 'auto',
      }
    );
  };

  const stopSTT = async () => {
    setStatusMessage('Processing speech input...');
    await voiceService.stopListening();
  };

  const handleMicPress = async () => {
    if (isListening) {
      await stopSTT();
    } else {
      await startSTT();
    }
  };

  // Badge helpers
  const getTTSCapabilityBadge = () => {
    if (!voiceAvailability) return null;

    if (voiceAvailability.engineType === 'LOCAL_ONNX_MODEL') {
      return (
        <View style={[styles.availabilityBadge, styles.availBadgeLocal]}>
          <Cpu size={16} color="#047857" />
          <Typography size="xs" weight="bold" color="#047857" style={{ marginLeft: 6, flex: 1 }}>
            TTS: Local Offline Model ✅ ({voiceAvailability.modelInfo?.modelName || 'Indic-ONNX'})
          </Typography>
        </View>
      );
    }

    if (voiceAvailability.capability === 'AVAILABLE_OFFLINE') {
      return (
        <View style={[styles.availabilityBadge, styles.availBadgeSuccess]}>
          <CheckCircle size={16} color="#15803D" />
          <Typography size="xs" weight="bold" color="#15803D" style={{ marginLeft: 6, flex: 1 }}>
            TTS: Device Offline Voice ✅ {voiceAvailability.voiceName ? `(${voiceAvailability.voiceName})` : ''}
          </Typography>
        </View>
      );
    }

    return (
      <View style={[styles.availabilityBadge, styles.availBadgeWarning]}>
        <VolumeX size={16} color="#B45309" />
        <Typography size="xs" weight="bold" color="#B45309" style={{ marginLeft: 6, flex: 1 }}>
          TTS: Device Voice ℹ️ ({voiceAvailability.reason || 'No offline engine'})
        </Typography>
      </View>
    );
  };

  const getSTTCapabilityBadge = () => {
    if (!sttAvailability) return null;

    if (sttAvailability.offlineAvailable) {
      return (
        <View style={[styles.availabilityBadge, styles.availBadgeLocal]}>
          <Cpu size={16} color="#047857" />
          <Typography size="xs" weight="bold" color="#047857" style={{ marginLeft: 6, flex: 1 }}>
            STT: Hybrid (Online + Offline ASR ✅ {sttAvailability.modelInfo?.modelName || 'IndicConformer'})
          </Typography>
        </View>
      );
    }

    return (
      <View style={[styles.availabilityBadge, styles.availBadgeInfo]}>
        <HelpCircle size={16} color="#1E40AF" />
        <Typography size="xs" weight="bold" color="#1E40AF" style={{ marginLeft: 6, flex: 1 }}>
          STT: Online STT Available ℹ️
        </Typography>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header with Square Back Button (Exact match with testing-translation.tsx) */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={24} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('voice_test') || 'Voice Testing'}
        </Text>
      </View>

      {/* Mode Switcher Tabs (Exact match with testing-translation.tsx tab structure) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('STT')}
          style={[
            styles.tabButton,
            activeTab === 'STT' ? styles.tabButtonActiveGreen : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'STT' ? styles.tabButtonTextActive : null,
            ]}
          >
            🎙️ Speech-to-Text (STT)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('TTS')}
          style={[
            styles.tabButton,
            activeTab === 'TTS' ? styles.tabButtonActivePurple : null,
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'TTS' ? styles.tabButtonTextActive : null,
            ]}
          >
            🔊 Text-to-Speech (TTS)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector Dropdown Pill (Identical to testing-translation.tsx) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowLangPicker(!showLangPicker)}
        style={[
          styles.langSelectorPill,
          { backgroundColor: isHc ? '#1F2937' : '#F8FAFC' },
        ]}
      >
        <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#1E40AF'}>
          {selectedLangObj.displayName} — {selectedLangObj.nativeName}
        </Typography>
        <ChevronDown size={20} color={isHc ? COLORS.hcTextPrimary : COLORS.textMuted} />
      </TouchableOpacity>

      {/* Dropdown Options Scroll List */}
      {showLangPicker && (
        <ScrollView style={styles.pickerScrollList} nestedScrollEnabled>
          {ALL_VOICE_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguageId === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedLanguageId(lang.id);
                  setShowLangPicker(false);
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
                  {lang.displayName} — {lang.nativeName}
                </Typography>
                {isSelected && <Check size={18} color="#16A34A" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Engine Capability Badges */}
      <View style={styles.badgesWrapper}>
        {activeTab === 'TTS' ? getTTSCapabilityBadge() : getSTTCapabilityBadge()}
      </View>

      {/* MODE 1: Speech-to-Text (STT) */}
      {activeTab === 'STT' && (
        <View style={styles.cardContent}>
          {/* Network Mode Toggle Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleSimulatedOffline}
            style={[
              styles.modeToggleButton,
              simulatedOffline ? styles.modeToggleOffline : styles.modeToggleOnline,
            ]}
          >
            {simulatedOffline ? (
              <WifiOff size={18} color="#B91C1C" />
            ) : (
              <Wifi size={18} color="#047857" />
            )}
            <Text
              style={[
                styles.modeToggleText,
                { color: simulatedOffline ? '#B91C1C' : '#047857' },
              ]}
            >
              Network: {simulatedOffline ? 'Simulated Offline (Local ASR Only)' : 'Online (Auto-Detect)'} — Tap to switch
            </Text>
          </TouchableOpacity>

          {/* Large Mic Trigger Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleMicPress}
            style={[
              styles.micActionButton,
              isListening ? styles.micActionButtonListening : styles.micActionButtonNormal,
            ]}
          >
            {isListening ? (
              <Square size={28} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Mic size={28} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.actionBtnText}>
              {isListening ? 'Stop Speaking' : `Start Speaking in ${selectedLangObj.displayName}`}
            </Text>
          </TouchableOpacity>

          {/* Pulsing Listening Indicator */}
          {isListening && (
            <View style={styles.listeningBadge}>
              <Text style={styles.listeningBadgeText}>
                🎙️ Listening in {selectedLangObj.displayName} ({activeSTTMode.toUpperCase()} STT)... Speak freely
              </Text>
            </View>
          )}

          {/* Transcript Output Box (Similar UI as Translation Result Box) */}
          <View style={styles.resultBoxWrapper}>
            <View style={styles.resultHeaderRow}>
              <Typography size="sm" weight="bold" color="#64748B">
                Recognized Speech ({selectedLangObj.displayName}):
              </Typography>
              <View style={styles.modeTag}>
                <Text style={styles.modeTagText}>Mode: {activeSTTMode.toUpperCase()}</Text>
              </View>
            </View>

            <View style={[styles.resultBox, isHc && styles.hcResultBox]}>
              <Typography
                size="base"
                color={recognizedText ? (isHc ? COLORS.hcTextPrimary : '#0F172A') : '#94A3B8'}
                style={{ fontStyle: recognizedText ? 'normal' : 'italic' }}
              >
                {recognizedText || 'Your recognized speech will appear here in native script...'}
              </Typography>
            </View>
          </View>
        </View>
      )}

      {/* MODE 2: Text-to-Speech (TTS) */}
      {activeTab === 'TTS' && (
        <View style={styles.cardContent}>
          {/* Input Text Box (Matching testing-translation.tsx) */}
          <TextInput
            value={ttsInputText}
            onChangeText={setTtsInputText}
            placeholder={`Type text in ${selectedLangObj.displayName} (${selectedLangObj.nativeName}) to speak out loud...`}
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            style={[
              styles.textInputField,
              {
                backgroundColor: isHc ? '#1E293B' : '#FAFAFC',
                color: isHc ? COLORS.hcTextPrimary : '#0F172A',
              },
            ]}
          />

          {/* Speak Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSynthesizing || !ttsInputText.trim()}
            onPress={handleSpeak}
            style={[
              styles.speakActionButton,
              {
                backgroundColor: isHc
                  ? COLORS.hcPrimary
                  : isSynthesizing || !ttsInputText.trim()
                  ? '#CBD5E1'
                  : '#8B5CF6',
              },
            ]}
          >
            {isSynthesizing ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnText}>Synthesizing...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Volume2 size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnText}>Speak Out Loud</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Status Banner */}
      <View style={[styles.statusCard, isHc && styles.hcStatusCard]}>
        <View style={styles.statusHeaderRow}>
          <Info size={18} color="#2563EB" />
          <Typography size="sm" weight="bold" color="#1E40AF" style={{ marginLeft: 6 }}>
            Engine Status
          </Typography>
        </View>
        <Typography size="xs" color="#334155" style={{ marginTop: 4 }}>
          {statusMessage}
        </Typography>
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
    marginVertical: SPACING.xs,
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
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: SPACING.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActiveGreen: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  tabButtonActivePurple: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0F172A',
  },
  langSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: SPACING.xs,
  },
  pickerScrollList: {
    maxHeight: 180,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  badgesWrapper: {
    marginBottom: SPACING.sm,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginVertical: 2,
    borderWidth: 1,
  },
  availBadgeLocal: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  availBadgeSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  availBadgeInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  availBadgeWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardContent: {
    width: '100%',
  },
  modeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  modeToggleOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  modeToggleOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  micActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    minHeight: 54,
    marginBottom: SPACING.sm,
  },
  micActionButtonNormal: {
    backgroundColor: '#16A34A',
  },
  micActionButtonListening: {
    backgroundColor: '#DC2626',
  },
  speakActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    minHeight: 54,
    marginBottom: SPACING.md,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  listeningBadgeText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  textInputField: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  resultBoxWrapper: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  resultBox: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 90,
    justifyContent: 'center',
  },
  hcResultBox: {
    backgroundColor: '#1E293B',
    borderColor: '#475569',
  },
  statusCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  hcStatusCard: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
