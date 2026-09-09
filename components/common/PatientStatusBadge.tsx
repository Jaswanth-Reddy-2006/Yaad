import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export type PatientStatusType = 'STABLE' | 'ATTENTION' | 'CRITICAL';

interface PatientStatusBadgeProps {
  status?: PatientStatusType | string;
  size?: 'sm' | 'md';
}

export const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({
  status = 'STABLE',
  size = 'md',
}) => {
  const norm = String(status).toUpperCase();
  const isAttention = norm.includes('ATTENTION') && !norm.includes('IMMEDIATE');
  const isCritical = norm.includes('CRITICAL') || norm.includes('IMMEDIATE') || norm.includes('URGENT');

  let bg = '#DCFCE7';
  let textColor = '#12803A';
  let dotColor = '#16A34A';
  let label = 'Stable & Active';
  let IconComponent = CheckCircle2;

  if (isCritical) {
    bg = '#FEE2E2';
    textColor = '#DC2626';
    dotColor = '#EF4444';
    label = 'Immediate Attention';
    IconComponent = AlertCircle;
  } else if (isAttention) {
    bg = '#FEF3C7';
    textColor = '#B45309';
    dotColor = '#E98200';
    label = 'Needs Attention';
    IconComponent = AlertTriangle;
  }

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: textColor }, isSmall && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  labelSm: {
    fontSize: 11,
    fontWeight: '600',
  },
});
