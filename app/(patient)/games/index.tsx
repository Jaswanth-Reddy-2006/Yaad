import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { LocalGamePreviewVideo } from '../../../components/games/LocalGamePreviewVideo';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

interface GameItem {
  id: string;
  titleKey: string;
  fallbackTitle: string;
  pastelBg: string;
  borderColor: string;
  titleColor: string;
  previewType: 'PAIR' | 'REMEMBER' | 'SPOT' | 'SORT' | 'OBJECT' | 'EVENTS';
  route: string;
}

const GAMES_LIST: GameItem[] = [
  {
    id: '1',
    titleKey: 'play_game',
    fallbackTitle: 'FIND THE MATCH',
    pastelBg: '#F5EFFE',
    borderColor: '#C084FC',
    titleColor: '#6D28D9',
    previewType: 'PAIR',
    route: '/(patient)/games/pair',
  },
  {
    id: '2',
    titleKey: 'recall_memory',
    fallbackTitle: 'REMEMBER PICTURES',
    pastelBg: '#E6F9ED',
    borderColor: '#86EFAC',
    titleColor: '#15803D',
    previewType: 'REMEMBER',
    route: '/(patient)/games/remember-pictures',
  },
  {
    id: '3',
    titleKey: 'reminders',
    fallbackTitle: 'SPOT THE DIFFERENCE',
    pastelBg: '#FFFBEB',
    borderColor: '#FDE68A',
    titleColor: '#D97706',
    previewType: 'SPOT',
    route: '/(patient)/games/triplet',
  },
];

export default function GameSelectionScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Header: Back Arrow Button on Left + Bold PLAY GAME Title Center */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel="Go Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={26} color="#6D28D9" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          PLAY GAME
        </Text>

        <View style={{ width: 44 }} />
      </View>

      {/* 3 Horizontal Cards Stacked Vertically (Matching media_1788280845461.png EXACTLY) */}
      <View style={styles.verticalStackContainer}>
        {GAMES_LIST.map((game) => (
          <TouchableOpacity
            key={game.id}
            activeOpacity={0.88}
            onPress={() => router.push(game.route as any)}
            style={[
              styles.horizontalGameCard,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : game.pastelBg,
                borderColor: game.borderColor,
              },
            ]}
          >
            {/* Left Graphic Portion: Local Gameplay Video Preview */}
            <View style={styles.previewLeftContainer}>
              <LocalGamePreviewVideo gameType={game.previewType} pastelBg="transparent" />
            </View>

            {/* Right Text Portion: Bold Uppercase Title */}
            <View style={styles.titleRightContainer}>
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[styles.gameTitleText, { color: isHc ? COLORS.hcTextPrimary : game.titleColor }]}
              >
                {game.fallbackTitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  verticalStackContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    marginVertical: SPACING.xs,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  horizontalGameCard: {
    width: '100%',
    flex: 1,
    minHeight: 120,
    maxHeight: 155,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  previewLeftContainer: {
    width: '58%',
    height: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  titleRightContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
    justifyContent: 'center',
  },
  gameTitleText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
