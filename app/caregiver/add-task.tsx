import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Text,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  X,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Volume2,
  Clock,
  Pill,
  Droplet,
  Utensils,
  Footprints,
  Brain,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { voiceNoteService } from '../../services/audio/VoiceNoteService';
import { cloudSyncService } from '../../services/sync/CloudSyncService';
import { RoutineScheduleItem } from '../../types';

export default function AddDailyTaskScreen() {
  const router = useRouter();
  const { patients, activePatientId } = useCaregiverStore();
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
  };

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('9:00 AM');
  const [category, setCategory] = useState<RoutineScheduleItem['category']>('MEDICINE');
  const [notes, setNotes] = useState('');

  // Voice note state
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(0);
  const [gentleTone, setGentleTone] = useState<'CHIME' | 'HARP' | 'ZEN_BELL'>('CHIME');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            voiceNoteService.stopRecording().then((res) => {
              setIsRecordingVoice(false);
              if (res.uri) {
                setVoiceNoteUri(res.uri);
                setVoiceNoteDuration(res.durationSec);
              }
            });
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingVoice]);

  const startVoiceRecording = async () => {
    try {
      const ok = await voiceNoteService.startRecording();
      if (ok) {
        setIsRecordingVoice(true);
        setRecordingSeconds(0);
      } else {
        Alert.alert('Microphone Permission', 'Could not access microphone. Please enable audio permissions.');
      }
    } catch (err: any) {
      Alert.alert('Microphone Error', err.message || 'Microphone recording failed.');
    }
  };

  const stopVoiceRecording = async () => {
    try {
      const res = await voiceNoteService.stopRecording();
      setIsRecordingVoice(false);
      if (res.uri) {
        setVoiceNoteUri(res.uri);
        setVoiceNoteDuration(res.durationSec);
      }
    } catch (err: any) {
      setIsRecordingVoice(false);
      Alert.alert('Recording Error', err.message || 'Failed to save recording.');
    }
  };

  const togglePreviewVoice = async () => {
    if (!voiceNoteUri) return;
    if (isPlayingPreview) {
      voiceNoteService.stop();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      await voiceNoteService.play(voiceNoteUri, () => {
        setIsPlayingPreview(false);
      });
    }
  };

  const handleDiscard = () => {
    if (title.trim() || voiceNoteUri) {
      Alert.alert('Discard Task?', 'Are you sure you want to discard your changes?', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            voiceNoteService.stop();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Task Name', 'Please enter a name for this daily task.');
      return;
    }

    try {
      setIsSaving(true);
      await offlineProximitySync.addRoutineItem({
        patientId: activePatient.id,
        title: title.trim(),
        time: time.trim() || '9:00 AM',
        category,
        repeat: 'DAILY',
        voiceNoteUrl: voiceNoteUri || undefined,
        voiceNoteDurationSec: voiceNoteDuration || undefined,
        gentleAlarmTone: gentleTone,
      });

      cloudSyncService.pushToCloud(activePatient.id);
      router.back();
    } catch (e: any) {
      setIsSaving(false);
      Alert.alert('Save Error', e.message || 'Could not save routine task.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Back Arrow and Discard */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDiscard}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>New Daily Task</Text>
          <Text style={styles.headerSubtitle}>For {activePatient.name}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDiscard}
          style={styles.discardHeaderBtn}
        >
          <Text style={styles.discardHeaderBtnText}>Discard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Morning Blood Pressure Medicine"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Scheduled Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Scheduled Time *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 9:00 AM"
            placeholderTextColor="#94A3B8"
            value={time}
            onChangeText={setTime}
          />
          <View style={styles.presetRow}>
            {['8:00 AM', '9:00 AM', '1:00 PM', '5:30 PM', '8:30 PM'].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setTime(p)}
                style={[styles.presetChip, time === p && styles.presetChipActive]}
              >
                <Text style={[styles.presetChipText, time === p && styles.presetChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {(
              [
                { key: 'MEDICINE', label: 'Medicine', Icon: Pill },
                { key: 'HYDRATION', label: 'Hydration', Icon: Droplet },
                { key: 'MEAL', label: 'Meal', Icon: Utensils },
                { key: 'WALK', label: 'Walk', Icon: Footprints },
                { key: 'ACTIVITY', label: 'Activity', Icon: Brain },
                { key: 'ROUTINE', label: 'Routine', Icon: Clock },
              ] as const
            ).map((item) => {
              const active = category === item.key;
              const IconComp = item.Icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setCategory(item.key)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <IconComp size={15} color={active ? '#FFFFFF' : '#475569'} style={{ marginRight: 6 }} />
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes / Instructions (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="e.g. Take with warm water after food"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Caregiver Recorded Voice Note Studio */}
        <View style={styles.voiceSectionCard}>
          <View style={styles.voiceHeaderRow}>
            <Volume2 size={20} color="#0F766E" />
            <Text style={styles.voiceCardTitle}>Caregiver Voice Note (Recommended)</Text>
          </View>
          <Text style={styles.voiceCardDesc}>
            Record a 5–15s warm voice instruction. Your loved one will hear your familiar voice when this routine task rings instead of a stressful buzzer.
          </Text>

          {voiceNoteUri ? (
            <View style={styles.voiceRecordedBox}>
              <View style={styles.voiceRecordedLeft}>
                <View style={styles.voiceSoundWaveDot} />
                <Text style={styles.voiceRecordedLabel}>
                  Voice Note Attached ({voiceNoteDuration}s)
                </Text>
              </View>
              <View style={styles.voiceRecordedRight}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={togglePreviewVoice}
                  style={styles.voicePlayBtn}
                >
                  {isPlayingPreview ? (
                    <Pause size={15} color="#0F766E" />
                  ) : (
                    <Play size={15} color="#0F766E" />
                  )}
                  <Text style={styles.voicePlayBtnText}>
                    {isPlayingPreview ? 'Pause' : 'Listen'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    voiceNoteService.stop();
                    setIsPlayingPreview(false);
                    setVoiceNoteUri(null);
                    setVoiceNoteDuration(0);
                  }}
                  style={styles.voiceTrashBtn}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ) : isRecordingVoice ? (
            <View style={styles.recordingActiveBox}>
              <View style={styles.recordingTimeIndicator}>
                <View style={styles.pulsingRedDot} />
                <Text style={styles.recordingTimeText}>
                  Recording: {recordingSeconds}s / 15s
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={stopVoiceRecording}
                style={styles.stopRecordingBtn}
              >
                <Square size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.stopRecordingBtnText}>Stop & Keep Note</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startVoiceRecording}
              style={styles.startRecordBtn}
            >
              <Mic size={20} color="#0F766E" style={{ marginRight: 8 }} />
              <Text style={styles.startRecordBtnText}>Tap to Record Voice Message (5-15s)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Gentle Tone Fallback */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gentle Alarm Tone (Fallback if no voice)</Text>
          <View style={styles.toneRow}>
            {[
              { key: 'CHIME', label: 'Zen Chime', desc: 'Soft temple harmonic' },
              { key: 'HARP', label: 'Warm Harp', desc: 'Flowing acoustic strings' },
              { key: 'ZEN_BELL', label: 'Temple Bell', desc: 'Low calming resonance' },
            ].map((tone) => {
              const active = gentleTone === tone.key;
              return (
                <TouchableOpacity
                  key={tone.key}
                  onPress={() => setGentleTone(tone.key as any)}
                  style={[styles.toneChip, active && styles.toneChipActive]}
                >
                  <Text style={[styles.toneChipTitle, active && styles.toneChipTitleActive]}>
                    {tone.label}
                  </Text>
                  <Text style={[styles.toneChipDesc, active && styles.toneChipDescActive]}>
                    {tone.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Actions: Discard & Save */}
        <View style={styles.bottomActionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDiscard}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveBtn}
          >
            <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>
              {isSaving ? 'Saving...' : 'Save Task to Routine'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  discardHeaderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  discardHeaderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  voiceSectionCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 20,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  voiceCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F766E',
  },
  voiceCardDesc: {
    fontSize: 13,
    color: '#115E59',
    lineHeight: 18,
    marginBottom: 14,
  },
  startRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  startRecordBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  recordingActiveBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  recordingTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingRedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  recordingTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  stopRecordingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stopRecordingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceRecordedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  voiceRecordedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceSoundWaveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F766E',
  },
  voiceRecordedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  voiceRecordedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voicePlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  voicePlayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  voiceTrashBtn: {
    padding: 6,
  },
  toneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toneChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    padding: 10,
  },
  toneChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  toneChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  toneChipTitleActive: {
    color: '#15803D',
  },
  toneChipDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13,
  },
  toneChipDescActive: {
    color: '#166534',
  },
  bottomActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.xl,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.xl,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
