import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, LogOut } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { GameCard } from '../../../components/games/Card';
import { GameHeader } from '../../../components/games/GameHeader';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { GameController, GameState } from '../../../features/games/engine/GameController';
import { GameDifficulty } from '../../../types';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

export default function MatchTripletGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const controllerRef = useRef<GameController | null>(null);

  useEffect(() => {
    const controller = new GameController('TRIPLET', difficulty, (newState) => {
      setGameState(newState);
    });
    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.dispose();
    };
  }, [difficulty]);

  const handleBackPress = () => {
    if (gameState && (gameState.status === 'PLAYING' || gameState.status === 'EVALUATING' || gameState.status === 'FEEDBACK')) {
      controllerRef.current?.pause();
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    controllerRef.current?.abandon();
    router.back();
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    controllerRef.current?.resume();
  };

  if (!gameState) return null;

  const numColumns = 3;

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Header */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={handleBackPress}
          style={styles.backBtn}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>

        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginLeft: SPACING.xs }}>
          {t('match_the_triplet')} ({difficulty})
        </Typography>
      </View>

      <GameHeader
        title={t('match_the_triplet')}
        difficulty={gameState.difficulty}
        matchesCount={gameState.matchesCount}
        totalRequiredMatches={gameState.totalRequiredMatches}
        elapsedSeconds={gameState.elapsedSeconds}
        hintsUsed={gameState.hintsUsed}
        onHint={() => controllerRef.current?.useHint()}
        onRestart={() => controllerRef.current?.restart()}
        gameInstruction={t('triplet_instruction')}
      />

      {/* Game Board Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={gameState.cards}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <GameCard
              card={item}
              positionIndex={index}
              disabled={gameState.isLocked}
              onSelect={(id) => controllerRef.current?.selectCard(id)}
            />
          )}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Abandon Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LogOut size={40} color="#DC2626" />
            <Typography size="xl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
              {t('leave_game_title')}
            </Typography>
            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
              {t('leave_game_desc')}
            </Typography>

            <View style={{ flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.sm }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={cancelLeave}
                style={[styles.modalActionBtn, { backgroundColor: COLORS.surfaceVariant }]}
              >
                <Typography size="sm" weight="bold" color="#0F172A">
                  {t('continue_game')}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={confirmLeave}
                style={[styles.modalActionBtn, { backgroundColor: '#DC2626' }]}
              >
                <Typography size="sm" weight="bold" color="#FFFFFF">
                  {t('leave')}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Completion Modal */}
      <GameResultModal
        visible={gameState.status === 'COMPLETED'}
        result={gameState.result || null}
        onPlayAgain={() => controllerRef.current?.restart()}
        onGoHome={() => router.replace('/(patient)')}
      />
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  flatListContent: {
    paddingBottom: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
});
