import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import {
  MatchCardsBannerIllustration,
  RememberPicturesBannerIllustration,
  FindThreeBannerIllustration,
  WordMatchBannerIllustration,
  AnimalSoundsBannerIllustration,
  FollowTheCupBannerIllustration,
} from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

interface GameItem {
  id: string;
  name: string;
  description: string;
  speechText: string;
  cardBg: string;
  borderColor: string;
  titleColor: string;
  btnBg: string;
  route: string;
  renderBanner: () => React.ReactNode;
}

export default function GamesHomeScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const gamesList: GameItem[] = [
    {
      id: '1',
      name: t('match_the_cards') || 'Match the Cards',
      description: t('match_cards_desc') || 'Find two pictures that are the same.',
      speechText: 'Match the Cards. Find two pictures that are the same. Take your time.',
      cardBg: '#FAF5FF',
      borderColor: '#DDD6FE',
      titleColor: '#6D28D9',
      btnBg: '#7C3AED',
      route: '/(patient)/games/pair',
      renderBanner: () => <MatchCardsBannerIllustration height={130} />,
    },
    {
      id: '2',
      name: t('remember_the_pictures') || 'Remember the Pictures',
      description: t('remember_pictures_desc') || 'Look carefully and remember.',
      speechText: 'Remember the Pictures. Look carefully at the pictures and remember what you see.',
      cardBg: '#F0FDF4',
      borderColor: '#BBF7D0',
      titleColor: '#15803D',
      btnBg: '#16A34A',
      route: '/(patient)/games/remember-pictures',
      renderBanner: () => <RememberPicturesBannerIllustration height={130} />,
    },
    {
      id: '3',
      name: t('follow_the_cup') || 'Follow the Glass',
      description: t('follow_cup_desc') || 'Follow the glass with the hidden star and guess where it is.',
      speechText: 'Follow the Glass. Watch where the golden star is hidden, follow the glasses, and guess.',
      cardBg: '#F5F3FF',
      borderColor: '#DDD6FE',
      titleColor: '#7C3AED',
      btnBg: '#7C3AED',
      route: '/(patient)/games/follow-cup',
      renderBanner: () => <FollowTheCupBannerIllustration height={130} />,
    },
    {
      id: '4',
      name: t('animal_sounds') || 'Animal Sounds',
      description: t('animal_sounds_desc') || 'Listen to the sound and tap the matching animal.',
      speechText: 'Animal Sounds. Listen to the sound and tap the animal that made it.',
      cardBg: '#FEF3C7',
      borderColor: '#FDE68A',
      titleColor: '#D97706',
      btnBg: '#D97706',
      route: '/(patient)/games/animal-sounds',
      renderBanner: () => <AnimalSoundsBannerIllustration height={130} />,
    },
    {
      id: '5',
      name: t('name_the_object') || 'Name the Object',
      description: t('name_object_desc') || 'Look at the picture and tap its matching name.',
      speechText: 'Name the Object. Look at the picture and tap the matching word.',
      cardBg: '#EFF6FF',
      borderColor: '#BFDBFE',
      titleColor: '#1D4ED8',
      btnBg: '#2563EB',
      route: '/(patient)/games/word-match',
      renderBanner: () => <WordMatchBannerIllustration height={130} />,
    },
    {
      id: '6',
      name: t('find_three') || 'Find Three',
      description: t('find_three_desc') || 'Find three pictures that belong together.',
      speechText: 'Find Three. Find three pictures that belong together.',
      cardBg: '#FFFBEB',
      borderColor: '#FDE68A',
      titleColor: '#D97706',
      btnBg: '#F59E0B',
      route: '/(patient)/games/triplet',
      renderBanner: () => <FindThreeBannerIllustration height={130} />,
    },
  ];

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header Row with Back Button, Title, and Main Speech Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenterText}>
          <Typography size="xl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('lets_play') || "Let's Play"}
          </Typography>
          <Typography size="xs" color={COLORS.textMuted} align="center" style={{ marginTop: 1 }}>
            {t('choose_a_game') || 'Choose a game'}
          </Typography>
        </View>

        <ListenButton
          textToSpeak="Let's Play. Choose a game from the list below."
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Dedicated Large Visual Game Cards */}
      <View style={styles.gamesStack}>
        {gamesList.map((game) => (
          <TouchableOpacity
            key={game.id}
            activeOpacity={0.92}
            accessibilityRole="button"
            accessibilityLabel={`Play ${game.name}`}
            onPress={() => router.push(game.route as any)}
            style={[
              styles.gameCard,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : game.cardBg,
                borderColor: isHc ? COLORS.hcBorder : game.borderColor,
              },
            ]}
          >
            {/* 1. Large Image Banner */}
            <View style={styles.bannerWrapper}>
              {game.renderBanner()}
            </View>

            {/* 2. Full-Width Title & Description */}
            <View style={styles.cardTextContainer}>
              <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : game.titleColor}>
                {game.name}
              </Typography>
              <Typography size="sm" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
                {game.description}
              </Typography>
            </View>

            {/* 3. Action Buttons Row: Listen + Wide PLAY */}
            <View style={styles.actionsRow}>
              <ListenButton
                textToSpeak={game.speechText}
                size="sm"
                variant="outline"
              />

              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Play ${game.name}`}
                onPress={() => router.push(game.route as any)}
                style={[styles.playBtn, { backgroundColor: game.btnBg }]}
              >
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {t('play') || 'PLAY'}
                </Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
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
  headerCenterText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  gamesStack: {
    gap: SPACING.lg,
  },
  gameCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerWrapper: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardTextContainer: {
    width: '100%',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
