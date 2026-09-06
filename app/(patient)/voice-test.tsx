import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Mic,
  Square,
  Volume2,
  Globe,
  Info,
  VolumeX,
  CheckCircle,
  HelpCircle,
  Cpu,
  Wifi,
  WifiOff,
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
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  // Local state for developer voice test screen
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('te');
  const [text, setText] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to listen');
  const [voiceAvailability, setVoiceAvailability] = useState<TTSAvailability | null>(null);
  const [sttAvailability, setSttAvailability] = useState<STTAvailability | null>(null);
  const [activeSTTMode, setActiveSTTMode] = useState<STTMode>('online');
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

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
        ? 'Internet OFF simulated: STT will strictly route to on-device Local Offline ASR.'
        : 'Internet ON restored: STT will automatically use Online Recognition.'
    );
  };

  // Handle "Speak Out Loud" button (Text-To-Speech)
  const handleSpeak = async () => {
    if (!text || text.trim().length === 0) {
      setStatusMessage('Please enter something to speak.');
      return;
    }

    const engineLabel =
      voiceAvailability?.engineType === 'LOCAL_ONNX_MODEL'
        ? 'Local Offline Model'
        : 'Device Voice';

    setStatusMessage(`Synthesizing (${engineLabel}) in ${selectedLangObj.displayName}...`);
    await voiceService.speak(text, selectedLangObj.id, {
      onStart: () => {
        setStatusMessage(`Speaking (${engineLabel}) in ${selectedLangObj.displayName}...`);
      },
      onDone: () => {
        setStatusMessage('Finished speaking.');
      },
      onError: (err) => {
        setStatusMessage(err || 'Failed to speak text.');
      },
    });
  };

  // Start speech recognition helper
  const startSTT = async () => {
    if (isListening) return;
    const modeLabel = simulatedOffline ? 'Offline Local ASR' : 'Auto Online/Offline';
    console.log(
      `[VoiceTest] Starting STT (${modeLabel}) for language: ${selectedLangObj.displayName} (${selectedLangObj.sttLocale})`
    );
    setRecognizedText('');
    setStatusMessage(`Listening for ${selectedLangObj.displayName} [${modeLabel}]... Speak freely.`);
    setIsListening(true);

    let sessionHasResult = false;

    await voiceService.startListening(
      selectedLangObj.id,
      {
        onResult: (transcript, isFinal, resultInfo) => {
          console.log(
            `[VoiceTest] Received transcript (isFinal=${isFinal}, mode=${resultInfo?.mode || 'online'}): "${transcript}"`
          );
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
          console.warn(`[VoiceTest] STT error: ${error}`);
          setStatusMessage(error);
          setIsListening(false);
        },
        onStateChange: (listening) => {
          console.log(`[VoiceTest] STT listening state: ${listening}`);
          setIsListening(listening);
          if (!listening) {
            if (!sessionHasResult) {
              setStatusMessage('No speech detected. Please try again.');
            } else {
              setStatusMessage('Speech recognized successfully.');
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

  // Stop speech recognition helper
  const stopSTT = async () => {
    console.log('[VoiceTest] Stopping STT...');
    setStatusMessage('Processing speech...');
    await voiceService.stopListening();
  };

  // Handle Mic Toggle Press (Tap to Start / Tap to Stop)
  const handleMicPress = async () => {
    if (isListening) {
      await stopSTT();
    } else {
      await startSTT();
    }
  };

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

    if (voiceAvailability.capability === 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN') {
      return (
        <View style={[styles.availabilityBadge, styles.availBadgeInfo]}>
          <HelpCircle size={16} color="#1E40AF" />
          <Typography size="xs" weight="bold" color="#1E40AF" style={{ marginLeft: 6, flex: 1 }}>
            TTS: Device Voice (Offline status unconfirmed) ℹ️
          </Typography>
        </View>
      );
    }

    return (
      <View style={[styles.availabilityBadge, styles.availBadgeWarning]}>
        <VolumeX size={16} color="#B45309" />
        <Typography size="xs" weight="bold" color="#B45309" style={{ marginLeft: 6, flex: 1 }}>
          TTS: Not Available Locally ⚠️ ({voiceAvailability.reason || 'No local engine'})
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

    if (sttAvailability.onlineAvailable) {
      return (
        <View style={[styles.availabilityBadge, styles.availBadgeInfo]}>
          <HelpCircle size={16} color="#1E40AF" />
          <Typography size="xs" weight="bold" color="#1E40AF" style={{ marginLeft: 6, flex: 1 }}>
            STT: Online STT Available (Offline requires model download) ℹ️
          </Typography>
        </View>
      );
    }

    return (
      <View style={[styles.availabilityBadge, styles.availBadgeWarning]}>
        <VolumeX size={16} color="#B45309" />
        <Typography size="xs" weight="bold" color="#B45309" style={{ marginLeft: 6, flex: 1 }}>
          STT: Unavailable Locally ⚠️ ({sttAvailability.error || 'Model not installed'})
        </Typography>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel="Go Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} strokeWidth={2.5} />
        </TouchableOpacity>

        <Typography
          size="xl"
          weight="bold"
          color={isHc ? COLORS.hcTextPrimary : '#0F172A'}
          style={styles.headerTitle}
        >
          Voice Test (Hybrid 22-Lang STT & TTS)
        </Typography>
      </View>

      {/* 1. Centralized 22-Language Selector */}
      <View style={[styles.sectionCard, isHc && styles.hcCard]}>
        <View style={styles.sectionHeaderRow}>
          <Globe size={24} color="#8B5CF6" />
          <Typography size="lg" weight="bold" style={styles.sectionTitle}>
            Language Selection (22 Indian Languages)
          </Typography>
        </View>

        {/* Active Locale & Selected Language Info */}
        <View style={styles.activeInfoRow}>
          <Typography size="sm" color={COLORS.textMuted} style={styles.subtitle}>
            Selected:{' '}
            <Typography size="sm" weight="bold" color="#0F172A">
              {selectedLangObj.displayName} ({selectedLangObj.nativeName})
            </Typography>
          </Typography>
          <Typography size="xs" color="#64748B">
            TTS Locale: {selectedLangObj.ttsLocale} | STT Locale: {selectedLangObj.sttLocale}
          </Typography>
        </View>

        {/* Dynamic TTS Engine & STT Capability Badges */}
        {getTTSCapabilityBadge()}
        {getSTTCapabilityBadge()}

        <View style={styles.languageGrid}>
          {ALL_VOICE_LANGUAGES.map((lang) => {
            const isSelected = selectedLangObj.id === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                activeOpacity={0.8}
                onPress={() => setSelectedLanguageId(lang.id)}
                style={[
                  styles.languageChip,
                  isSelected && styles.languageChipSelected,
                  isHc && isSelected && styles.languageChipSelectedHc,
                ]}
              >
                <Typography
                  size="sm"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? (isHc ? '#FFFFFF' : '#15803D') : '#334155'}
                >
                  {lang.displayName} — {lang.nativeName}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Text Input Area */}
      <View style={[styles.sectionCard, isHc && styles.hcCard]}>
        <Typography size="lg" weight="bold" style={styles.sectionTitle}>
          Text Input
        </Typography>
        <Typography size="sm" color={COLORS.textMuted} style={styles.subtitle}>
          Type text to test speech synthesis in {selectedLangObj.displayName}
        </Typography>

        <TextInput
          style={[styles.textInput, isHc && styles.hcTextInput]}
          multiline
          numberOfLines={3}
          value={text}
          onChangeText={setText}
          placeholder={`Type something in ${selectedLangObj.displayName} (${selectedLangObj.nativeName})...`}
          placeholderTextColor="#94A3B8"
        />

        {/* 3. Speak Out Loud Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSpeak}
          style={[styles.actionButton, styles.speakButton]}
        >
          <Volume2 size={24} color="#FFFFFF" style={{ marginRight: SPACING.xs }} />
          <Text style={styles.speakButtonText}>Speak Out Loud</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Speech Recognition Section with Online / Offline Toggle */}
      <View style={[styles.sectionCard, isHc && styles.hcCard]}>
        <View style={styles.sectionHeaderRow}>
          <Mic size={24} color="#16A34A" />
          <Typography size="lg" weight="bold" style={styles.sectionTitle}>
            Speech Recognition ({selectedLangObj.displayName})
          </Typography>
        </View>
        <Typography size="sm" color={COLORS.textMuted} style={styles.subtitle}>
          Target STT Locale: {selectedLangObj.sttLocale} | Native Script Preserved
        </Typography>

        {/* Internet / Offline Mode Toggle Button for Verification */}
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
            Network Mode: {simulatedOffline ? 'Simulated Offline (Local ASR Only)' : 'Online (Auto-Detect)'} — Tap to switch
          </Text>
        </TouchableOpacity>

        <View style={styles.micContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleMicPress}
            style={[
              styles.micButton,
              isListening && styles.micButtonListening,
              isHc && isListening && styles.micButtonListeningHc,
            ]}
          >
            {isListening ? (
              <Square size={36} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Mic size={36} color="#FFFFFF" />
            )}
            <Text style={styles.micButtonText}>
              {isListening ? 'Stop Speaking' : 'Start Speaking'}
            </Text>
          </TouchableOpacity>

          {/* Listening Indicator */}
          {isListening ? (
            <View style={styles.listeningBadge}>
              <Text style={styles.listeningBadgeText}>
                🎙️ Listening in {selectedLangObj.displayName} ({activeSTTMode.toUpperCase()} STT)... Speak freely
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 5. Recognized Speech Area */}
      <View style={[styles.sectionCard, isHc && styles.hcCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography size="lg" weight="bold" style={styles.sectionTitle}>
            You said:
          </Typography>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>Mode: {activeSTTMode.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.transcriptContainer, isHc && styles.hcTranscriptContainer]}>
          <Typography
            size="base"
            color={recognizedText ? '#0F172A' : '#94A3B8'}
            style={{ fontStyle: recognizedText ? 'normal' : 'italic' }}
          >
            {recognizedText || 'Your recognized speech will appear here in native script...'}
          </Typography>
        </View>
      </View>

      {/* 6. Status / Error Area */}
      <View style={[styles.sectionCard, styles.statusCard, isHc && styles.hcCard]}>
        <View style={styles.sectionHeaderRow}>
          <Info size={20} color="#2563EB" />
          <Typography size="base" weight="semibold" color="#1E40AF" style={{ marginLeft: SPACING.xs }}>
            Status
          </Typography>
        </View>
        <Typography size="sm" color="#334155" style={{ marginTop: 4 }}>
          {statusMessage}
        </Typography>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 140,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hcCard: {
    backgroundColor: '#1E293B',
    borderColor: '#475569',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: SPACING.xs,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeInfoRow: {
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 2,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginVertical: 4,
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
  modeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
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
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  languageChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageChipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  languageChipSelectedHc: {
    backgroundColor: '#15803D',
    borderColor: '#86EFAC',
  },
  textInput: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  hcTextInput: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    color: '#F8FAFC',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    minHeight: 52,
  },
  speakButton: {
    backgroundColor: '#2563EB',
  },
  speakButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  micContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  micButton: {
    backgroundColor: '#16A34A',
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 64,
  },
  micButtonListening: {
    backgroundColor: '#DC2626',
  },
  micButtonListeningHc: {
    backgroundColor: '#B91C1C',
  },
  micButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  listeningBadge: {
    marginTop: SPACING.sm,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  listeningBadgeText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
  transcriptContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 80,
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  hcTranscriptContainer: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
  },
  statusCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
});
