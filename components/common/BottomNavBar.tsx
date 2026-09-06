import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Mic, Heart, Volume2, X } from 'lucide-react-native';
import { Typography } from './Typography';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { preferences, t } = useAccessibilityStore();
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const isHc = preferences.highContrast;

  const isHomeActive = pathname === '/' || pathname === '/(patient)' || pathname === '/(patient)/';
  const isHelpActive = pathname.includes('/help');

  return (
    <>
      <View style={styles.floatingContainer}>
        <View style={[styles.wrapper, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Tab 1: Home */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(patient)')}
            style={styles.tabItem}
          >
            <Home
              size={26}
              color={isHomeActive ? '#16A34A' : COLORS.textMuted}
              strokeWidth={2.2}
            />
            <Typography
              size="xs"
              weight={isHomeActive ? 'bold' : 'medium'}
              color={isHomeActive ? '#16A34A' : COLORS.textMuted}
              style={{ marginTop: 2 }}
            >
              {t('home')}
            </Typography>
          </TouchableOpacity>

          {/* CENTER TAB: Speak (Mic Button) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowVoiceModal(true)}
            style={styles.centerMicWrapper}
          >
            <View style={styles.centerMicCircle}>
              <Mic size={26} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Typography size="xs" weight="bold" color="#16A34A" style={{ marginTop: 2 }}>
              {t('speak')}
            </Typography>
          </TouchableOpacity>

          {/* Tab 3: Help */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(patient)/help')}
            style={styles.tabItem}
          >
            <Heart
              size={26}
              color={isHelpActive ? COLORS.helpRed : COLORS.textMuted}
              strokeWidth={2.2}
              fill={isHelpActive ? COLORS.helpRedLight : 'none'}
            />
            <Typography
              size="xs"
              weight={isHelpActive ? 'bold' : 'medium'}
              color={isHelpActive ? COLORS.helpRed : COLORS.textMuted}
              style={{ marginTop: 2 }}
            >
              {t('help')}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Assistant Speaking Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => setShowVoiceModal(false)} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.speakingRippleCircle}>
              <Volume2 size={44} color="#FFFFFF" />
            </View>

            <Typography size="xl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
              {t('listening')}
            </Typography>

            {/* Quick Intent Shortcut Buttons for Voice-First Usage */}
            <View style={{ width: '100%', marginTop: SPACING.md, gap: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  const { voiceService } = await import('../../services/VoiceService');
                  await voiceService.processQueryAndSpeak('What should I do now?');
                  setShowVoiceModal(false);
                  router.push('/(patient)/games/pair');
                }}
                style={{ backgroundColor: '#DCFCE7', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#86EFAC', alignItems: 'center' }}
              >
                <Typography size="sm" weight="bold" color="#15803D">
                  {t('voice_prompt_do_now')}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  const { voiceService } = await import('../../services/VoiceService');
                  await voiceService.processQueryAndSpeak('What is my next reminder?');
                  setShowVoiceModal(false);
                  router.push('/(patient)/reminders');
                }}
                style={{ backgroundColor: '#DBEAFE', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#93C5FD', alignItems: 'center' }}
              >
                <Typography size="sm" weight="bold" color="#1E40AF">
                  {t('voice_prompt_next_reminder')}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  const { voiceService } = await import('../../services/VoiceService');
                  await voiceService.processQueryAndSpeak('Help me');
                  setShowVoiceModal(false);
                  router.push('/(patient)/help');
                }}
                style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center' }}
              >
                <Typography size="sm" weight="bold" color="#991B1B">
                  {t('voice_prompt_help_me')}
                </Typography>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowVoiceModal(false)}
              style={styles.stopBtn}
            >
              <Typography size="base" weight="bold" color="#FFFFFF">
                {t('done_speaking')}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: 'transparent',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 68,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMicWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -6,
  },
  centerMicCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: 4,
  },
  speakingRippleCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  stopBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
    width: '100%',
    alignItems: 'center',
  },
});
