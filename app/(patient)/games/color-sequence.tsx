import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

const TILES = [
  { id: 'red',    color: '#EF4444', litColor: '#FF6B6B', darkColor: '#B91C1C' },
  { id: 'blue',   color: '#3B82F6', litColor: '#93C5FD', darkColor: '#1D4ED8' },
  { id: 'yellow', color: '#EAB308', litColor: '#FDE047', darkColor: '#A16207' },
  { id: 'green',  color: '#22C55E', litColor: '#4ADE80', darkColor: '#15803D' },
];

type Phase = 'READY' | 'WATCHING' | 'TAPPING' | 'CORRECT_ROUND' | 'GAME_OVER';

export default function ColorSequenceScreen() {
  const [phase, setPhase] = useState<Phase>('READY');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerTaps, setPlayerTaps] = useState<number[]>([]);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [litTileIndex, setLitTileIndex] = useState<number | null>(null);
  const [wrongTileIndex, setWrongTileIndex] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const router = useRouter();

  // Each shared value declared individually at top level — array literal violates Rules of Hooks
  const tileAnim0 = useSharedValue(0);
  const tileAnim1 = useSharedValue(0);
  const tileAnim2 = useSharedValue(0);
  const tileAnim3 = useSharedValue(0);
  const tileAnims = [tileAnim0, tileAnim1, tileAnim2, tileAnim3];

  const generateSequence = (length: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  };

  const playSequence = useCallback((seq: number[]) => {
    setPhase('WATCHING');
    setPlayerTaps([]);
    
    seq.forEach((tileIdx, step) => {
      const delay = step * 1100;
      setTimeout(() => {
        setLitTileIndex(tileIdx);
        tileAnims[tileIdx].value = withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 300 })
        );
        setTimeout(() => setLitTileIndex(null), 700);
      }, delay);
    });
    
    const totalDuration = seq.length * 1100 + 400;
    setTimeout(() => {
      setPhase('TAPPING');
      voiceService.speak('Your turn! Tap the tiles in order.');
    }, totalDuration);
  }, [tileAnims]);

  const startNewRound = useCallback((roundLength: number) => {
    const seq = generateSequence(roundLength);
    setSequence(seq);
    setTimeout(() => playSequence(seq), 800);
  }, [playSequence]);

  const finishGame = (correct: number, mist: number) => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score = Math.max(100, correct * 120 - mist * 60);
    const accuracy = Math.round((correct / Math.max(correct + mist, 1)) * 100);
    
    const result: GameResult = {
      id: `result-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      patientId: 'local-patient-1',
      gameId: 'COLOR_SEQUENCE',
      difficulty: 'EASY',
      score,
      accuracy,
      durationSeconds: elapsed,
      attempts: 1,
      mistakes: mist,
      hintsUsed: 0,
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    setPhase('GAME_OVER');
    setGameResult(result);
    gameRepository.saveResult(result).catch(() => {});
  };

  const handleTileTap = (tileIdx: number) => {
    if (phase !== 'TAPPING') return;
    
    const newTaps = [...playerTaps, tileIdx];
    const stepIdx = playerTaps.length;
    
    if (tileIdx === sequence[stepIdx]) {
      setPlayerTaps(newTaps);
      
      if (newTaps.length === sequence.length) {
        const newCorrect = correctRounds + 1;
        setCorrectRounds(newCorrect);
        setPhase('CORRECT_ROUND');
        voiceService.speak('Excellent! Well done!');
        
        setTimeout(() => {
          const nextLength = sequence.length + 1;
          if (nextLength > 10 || newCorrect >= 8) {
            finishGame(newCorrect, mistakes);
          } else {
            startNewRound(nextLength);
          }
        }, 1000);
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setWrongTileIndex(tileIdx);
      tileAnims[tileIdx].value = withSequence(
        withTiming(0.5, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(0.5, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
      setTimeout(() => setWrongTileIndex(null), 700);
      
      voiceService.speak('Oops, try again!');
      
      if (newMistakes >= 3) {
        setTimeout(() => finishGame(correctRounds, newMistakes), 800);
      } else {
        setPlayerTaps([]);
        setTimeout(() => playSequence(sequence), 1200);
      }
    }
  };

  useEffect(() => {
    const t = setTimeout(() => startNewRound(3), 1500);
    return () => clearTimeout(t);
  }, [startNewRound]);

  const tile0Style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + tileAnims[0].value * 0.12 }] }));
  const tile1Style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + tileAnims[1].value * 0.12 }] }));
  const tile2Style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + tileAnims[2].value * 0.12 }] }));
  const tile3Style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + tileAnims[3].value * 0.12 }] }));
  const tileStyles = [tile0Style, tile1Style, tile2Style, tile3Style];

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowLeaveModal(true)}>
          <ArrowLeft size={24} color="#15803D" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color="#0F172A" align="center">{t('color_sequence')}</Typography>
          <Typography size="xs" color={COLORS.textMuted} align="center">
            {phase === 'WATCHING' ? t('watch_carefully') : phase === 'TAPPING' ? `${t('tap')} ${playerTaps.length + 1} / ${sequence.length}` : phase === 'CORRECT_ROUND' ? `✓ ${t('well_done')}` : ''}
          </Typography>
        </View>
        <ListenButton textToSpeak="Color Sequence. Watch the tiles light up then tap them in the same order!" size="sm" variant="secondary" />
      </View>
      
      {/* Mistake indicators */}
      <View style={styles.mistakesRow}>
        <Typography size="sm" color={COLORS.textSecondary}>{t('mistakes')}: </Typography>
        {[0,1,2].map(i => (
          <View key={i} style={[styles.mistakeDot, { backgroundColor: i < mistakes ? '#EF4444' : '#E2E8F0' }]} />
        ))}
        <View style={styles.roundBadge}>
          <Typography size="sm" weight="bold" color="#15803D">{t('round')} {correctRounds + 1}</Typography>
        </View>
      </View>
      
      {/* Progress dots showing sequence position */}
      {(phase === 'WATCHING' || phase === 'TAPPING') && (
        <View style={styles.sequenceDots}>
          {sequence.map((_, i) => (
            <View key={i} style={[styles.seqDot, {
              backgroundColor: i < playerTaps.length ? '#16A34A' : litTileIndex !== null && phase === 'WATCHING' ? '#F59E0B' : '#CBD5E1',
              width: i < playerTaps.length ? 16 : 10,
            }]} />
          ))}
        </View>
      )}
      
      {/* Main 2x2 Tile Grid */}
      <View style={[styles.tileGrid, phase !== 'TAPPING' ? styles.tileGridDisabled : null]}>
        {[0, 1, 2, 3].map(i => {
          const tile = TILES[i];
          const isLit = litTileIndex === i;
          const isWrongTile = wrongTileIndex === i;
          return (
            <Animated.View key={tile.id} style={[styles.tileWrapper, tileStyles[i]]}>
              <Pressable
                style={[styles.tile, { backgroundColor: isLit ? tile.litColor : isWrongTile ? '#DC2626' : tile.color,
                  shadowColor: tile.darkColor,
                }]}
                onPress={() => handleTileTap(i)}
                disabled={phase !== 'TAPPING'}
              >
                {isLit && <View style={styles.tileLitOverlay} />}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      
      {/* Status message */}
      <View style={styles.statusBox}>
        {phase === 'READY' && <Typography size="base" color="#15803D" align="center">{t('get_ready')}</Typography>}
        {phase === 'WATCHING' && <Typography size="base" weight="semibold" color="#D97706" align="center">👀 {t('watch_the_sequence')}</Typography>}
        {phase === 'TAPPING' && <Typography size="base" weight="semibold" color="#2563EB" align="center">👆 {t('tap_in_same_order')}</Typography>}
        {phase === 'CORRECT_ROUND' && <Typography size="lg" weight="bold" color="#16A34A" align="center">✓ {t('excellent')}</Typography>}
      </View>
      
      <LeaveGameModal
        visible={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => { setShowLeaveModal(false); router.back(); }}
      />
      {gameResult && (
        <GameResultModal
          visible={true}
          result={gameResult}
          onPlayAgain={() => { setGameResult(null); setCorrectRounds(0); setMistakes(0); setPhase('READY'); startTimeRef.current = Date.now(); setTimeout(() => startNewRound(3), 800); }}
          onGoHome={() => router.back()}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.xs, marginBottom: SPACING.sm },
  backBtn: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#BBF7D0' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xs },
  mistakesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: 6 },
  mistakeDot: { width: 14, height: 14, borderRadius: 7 },
  roundBadge: { flex: 1, alignItems: 'flex-end', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  sequenceDots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: SPACING.md, flexWrap: 'wrap' },
  seqDot: { height: 10, borderRadius: 5 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', flex: 1 },
  tileGridDisabled: { opacity: 0.85 },
  tileWrapper: { width: '44%', aspectRatio: 1 },
  tile: { flex: 1, borderRadius: 20, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 8, overflow: 'hidden' },
  tileLitOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', opacity: 0.35, borderRadius: 20 },
  statusBox: { paddingVertical: SPACING.md, alignItems: 'center' },
});
