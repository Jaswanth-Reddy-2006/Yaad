import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface OfflineStatusBannerProps {
  isOffline?: boolean;
  lastSyncedTime?: string | null;
  onSyncPress?: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({
  isOffline = false,
  lastSyncedTime,
  onSyncPress,
}) => {
  if (!isOffline) {
    return (
      <View style={styles.onlineContainer}>
        <View style={styles.leftRow}>
          <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
          <Text style={styles.onlineText}>All care data synchronized</Text>
        </View>
        {lastSyncedTime && (
          <Text style={styles.syncTimeText}>
            Updated {lastSyncedTime}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.offlineContainer}>
      <View style={styles.leftRow}>
        <View style={[styles.statusDot, { backgroundColor: '#E98200' }]} />
        <View>
          <Text style={styles.offlineTitle}>Offline Mode</Text>
          <Text style={styles.offlineSub}>
            Showing saved care information {lastSyncedTime ? `• Synced ${lastSyncedTime}` : ''}
          </Text>
        </View>
      </View>
      {onSyncPress && (
        <TouchableOpacity activeOpacity={0.8} onPress={onSyncPress} style={styles.syncBtn}>
          <RefreshCw size={13} color="#B45309" />
          <Text style={styles.syncBtnText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F3',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#12803A',
  },
  syncTimeText: {
    fontSize: 11,
    color: '#64748B',
  },
  offlineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  offlineSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
});
