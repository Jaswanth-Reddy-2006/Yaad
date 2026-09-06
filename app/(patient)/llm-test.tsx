import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bot,
  Send,
  Trash2,
  Sparkles,
  HelpCircle,
  Clock,
  Pill,
  UserCheck,
  MapPin,
  Bell,
  Gamepad2,
  Calendar,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { OfflineCompanionEngine } from '../companion/OfflineCompanionEngine';

const QUICK_QUESTIONS = [
  { label: 'What is my name?', icon: UserCheck, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'When is my medicine?', icon: Clock, color: '#16A34A', bg: '#DCFCE7' },
  { label: 'What medicine do I take?', icon: Pill, color: '#7C3AED', bg: '#F3E8FF' },
  { label: 'Who is my caregiver?', icon: UserCheck, color: '#0D9488', bg: '#CCFBF1' },
  { label: 'Where am I?', icon: MapPin, color: '#EA580C', bg: '#FFF7ED' },
  { label: 'What is my next reminder?', icon: Bell, color: '#D97706', bg: '#FEF3C7' },
  { label: 'Recommend a game', icon: Gamepad2, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'What should I do now?', icon: Calendar, color: '#16A34A', bg: '#DCFCE7' },
];

export default function OfflineCompanionTestScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [inputQuery, setInputQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAsk = async (queryToAsk: string) => {
    const trimmed = queryToAsk.trim();
    if (!trimmed) {
      setValidationError('Please enter a question.');
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setActiveQuery(trimmed);
    setIsLoading(true);

    try {
      // Process question via OfflineCompanionEngine and local SQLite database
      const result = await OfflineCompanionEngine.processWithDatabase(trimmed);
      setResponse(result.response);
      setIntent(result.intent);
      setConfidence(result.confidence);
    } catch (err) {
      console.error('[OfflineCompanionTest] Error processing question:', err);
      setErrorMessage("Sorry, I couldn't get that information right now.");
      setResponse("Sorry, I couldn't get that information right now.");
      setIntent('ERROR');
      setConfidence(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputQuery('');
    setActiveQuery(null);
    setResponse(null);
    setIntent(null);
    setConfidence(null);
    setValidationError(null);
    setErrorMessage(null);
    setIsLoading(false);
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isHc ? COLORS.hcCardBackground : '#F1F5F9' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : COLORS.textPrimary}>
            Offline Companion Test
          </Typography>
          <Typography size="xs" color={isHc ? COLORS.hcTextSecondary : COLORS.textSecondary}>
            Test the dementia companion using local patient information.
          </Typography>
        </View>

        {activeQuery || response ? (
          <TouchableOpacity
            accessibilityLabel="Clear results"
            accessibilityRole="button"
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Trash2 size={20} color={COLORS.danger} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Response Display Area */}
      <View
        style={[
          styles.responseCard,
          {
            backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
            borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitle}>
            <Bot size={22} color={COLORS.primary} />
            <Typography size="sm" weight="bold" color={isHc ? COLORS.hcTextPrimary : COLORS.textPrimary}>
              Companion Response
            </Typography>
          </View>
          {intent ? (
            <View style={[styles.intentBadge, { backgroundColor: intent === 'UNKNOWN' ? '#FEF2F2' : '#EFF6FF' }]}>
              <Text
                style={[
                  styles.intentBadgeText,
                  { color: intent === 'UNKNOWN' ? COLORS.danger : COLORS.gameBlue },
                ]}
              >
                Intent: {intent} {confidence !== null ? `(${Math.round(confidence * 100)}%)` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: isHc ? COLORS.hcTextSecondary : COLORS.textSecondary }]}>
              Thinking...
            </Text>
          </View>
        ) : response ? (
          <View style={styles.dialogueBox}>
            {activeQuery ? (
              <View style={styles.userBubble}>
                <Typography size="xs" weight="bold" color={COLORS.textSecondary}>
                  You:
                </Typography>
                <Typography size="sm" color={COLORS.textPrimary} style={styles.bubbleText}>
                  "{activeQuery}"
                </Typography>
              </View>
            ) : null}

            <View
              style={[
                styles.companionBubble,
                { backgroundColor: isHc ? '#1E293B' : '#F0FDF4', borderColor: '#BBF7D0' },
              ]}
            >
              <Typography size="xs" weight="bold" color={COLORS.primaryDark}>
                Companion:
              </Typography>
              <Typography size="base" weight="semibold" color={isHc ? COLORS.hcTextPrimary : '#14532D'}>
                "{response}"
              </Typography>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <HelpCircle size={32} color={COLORS.textMuted} />
            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 8 }}>
              Tap a quick question below or type your own question to test the offline companion.
            </Typography>
          </View>
        )}
      </View>

      {/* Custom Question Input */}
      <View style={styles.inputSection}>
        <Typography size="sm" weight="bold" color={isHc ? COLORS.hcTextPrimary : COLORS.textPrimary}>
          Ask Custom Question
        </Typography>

        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
              borderColor: validationError ? COLORS.danger : isHc ? COLORS.hcBorder : '#CBD5E1',
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: isHc ? COLORS.hcTextPrimary : COLORS.textPrimary }]}
            placeholder="Ask the companion something..."
            placeholderTextColor={COLORS.textMuted}
            value={inputQuery}
            onChangeText={(text) => {
              setInputQuery(text);
              if (validationError) setValidationError(null);
            }}
            onSubmitEditing={() => handleAsk(inputQuery)}
            returnKeyType="send"
            editable={!isLoading}
          />

          <TouchableOpacity
            disabled={isLoading}
            onPress={() => handleAsk(inputQuery)}
            style={[
              styles.sendButton,
              { backgroundColor: isLoading ? COLORS.textMuted : COLORS.primary },
            ]}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {validationError ? (
          <Text style={styles.validationText}>{validationError}</Text>
        ) : null}
      </View>

      {/* Quick Questions Section */}
      <View style={styles.quickSection}>
        <View style={styles.quickHeader}>
          <Sparkles size={18} color={COLORS.primary} />
          <Typography size="sm" weight="bold" color={isHc ? COLORS.hcTextPrimary : COLORS.textPrimary}>
            Quick Test Questions
          </Typography>
        </View>

        <View style={styles.quickGrid}>
          {QUICK_QUESTIONS.map((q, index) => {
            const Icon = q.icon;
            return (
              <TouchableOpacity
                key={index}
                disabled={isLoading}
                activeOpacity={0.7}
                onPress={() => {
                  setInputQuery(q.label);
                  handleAsk(q.label);
                }}
                style={[
                  styles.quickButton,
                  {
                    backgroundColor: isHc ? COLORS.hcCardBackground : q.bg,
                    borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
                  },
                ]}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: q.color }]}>
                  <Icon size={16} color="#FFFFFF" />
                </View>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.quickButtonText,
                    { color: isHc ? COLORS.hcTextPrimary : COLORS.textPrimary },
                  ]}
                >
                  {q.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  responseCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  intentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dialogueBox: {
    gap: SPACING.sm,
  },
  userBubble: {
    padding: SPACING.xs,
  },
  bubbleText: {
    fontStyle: 'italic',
  },
  companionBubble: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  validationText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  quickSection: {
    marginBottom: SPACING.lg,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    gap: 8,
  },
  quickIconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
