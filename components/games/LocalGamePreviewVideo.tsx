import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Typography } from '../common/Typography';
import { RADIUS } from '../../constants/theme';

export interface LocalGamePreviewVideoProps {
  gameType: 'PAIR' | 'REMEMBER' | 'SPOT' | 'SORT' | 'OBJECT' | 'EVENTS';
  pastelBg: string;
}

export const LocalGamePreviewVideo: React.FC<LocalGamePreviewVideoProps> = ({
  gameType,
  pastelBg,
}) => {
  const getOfflineVideoDataUri = (type: string): string => {
    let svgBody = '';

    if (type === 'PAIR') {
      svgBody = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 240" width="100%" height="100%">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F3E8FF" />
              <stop offset="100%" stop-color="#E9D5FF" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.12"/>
            </filter>
          </defs>

          <rect width="440" height="240" fill="url(#bgGrad)" rx="16"/>

          <!-- Card 1: Back -->
          <rect x="25" y="45" width="85" height="125" rx="12" fill="#7C3AED" filter="url(#shadow)"/>
          <circle cx="67" cy="107" r="18" fill="#FFFFFF" opacity="0.3"/>

          <!-- Card 2: Matching Revealed -->
          <rect x="125" y="45" width="85" height="125" rx="12" fill="#FFFFFF" stroke="#16A34A" stroke-width="4" filter="url(#shadow)">
            <animate attributeName="stroke-width" values="4;7;4" dur="1.5s" repeatCount="indefinite"/>
          </rect>
          <circle cx="167" cy="107" r="22" fill="#DCFCE7"/>
          <text x="167" y="113" font-size="14" font-weight="bold" fill="#16A34A" text-anchor="middle">APPLE</text>

          <!-- Card 3: Matching Revealed -->
          <rect x="225" y="45" width="85" height="125" rx="12" fill="#FFFFFF" stroke="#16A34A" stroke-width="4" filter="url(#shadow)">
            <animate attributeName="stroke-width" values="4;7;4" dur="1.5s" repeatCount="indefinite"/>
          </rect>
          <circle cx="267" cy="107" r="22" fill="#DCFCE7"/>
          <text x="267" y="113" font-size="14" font-weight="bold" fill="#16A34A" text-anchor="middle">APPLE</text>

          <!-- Card 4: Back -->
          <rect x="325" y="45" width="85" height="125" rx="12" fill="#7C3AED" filter="url(#shadow)"/>
          <circle cx="367" cy="107" r="18" fill="#FFFFFF" opacity="0.3"/>

          <rect x="140" y="192" width="160" height="32" rx="16" fill="#15803D"/>
          <text x="220" y="213" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MATCH FOUND</text>
        </svg>
      `;
    } else if (type === 'REMEMBER') {
      svgBody = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 240" width="100%" height="100%">
          <rect width="440" height="240" fill="#DCFCE7" rx="16"/>
          
          <g>
            <rect x="40" y="35" width="100" height="100" rx="14" fill="#FFFFFF" stroke="#16A34A" stroke-width="3"/>
            <text x="90" y="90" font-size="14" font-weight="bold" fill="#16A34A" text-anchor="middle">APPLE</text>

            <rect x="170" y="35" width="100" height="100" rx="14" fill="#FFFFFF" stroke="#16A34A" stroke-width="3"/>
            <text x="220" y="90" font-size="14" font-weight="bold" fill="#16A34A" text-anchor="middle">FLOWER</text>

            <rect x="300" y="35" width="100" height="100" rx="14" fill="#FFFFFF" stroke="#16A34A" stroke-width="3"/>
            <text x="350" y="90" font-size="14" font-weight="bold" fill="#16A34A" text-anchor="middle">STAR</text>
          </g>

          <circle cx="220" cy="180" r="28" fill="none" stroke="#E2E8F0" stroke-width="6"/>
          <circle cx="220" cy="180" r="28" fill="none" stroke="#F59E0B" stroke-width="6" stroke-dasharray="175" stroke-dashoffset="40">
            <animateTransform attributeName="transform" type="rotate" from="0 220 180" to="360 220 180" dur="4s" repeatCount="indefinite"/>
          </circle>
          <text x="220" y="188" font-size="22" font-weight="bold" fill="#B45309" text-anchor="middle">5s</text>

          <text x="220" y="225" font-size="14" font-weight="bold" fill="#15803D" text-anchor="middle">Memorize Pictures...</text>
        </svg>
      `;
    } else {
      svgBody = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 240" width="100%" height="100%">
          <rect width="440" height="240" fill="#FEF3C7" rx="16"/>

          <rect x="40" y="40" width="160" height="120" rx="14" fill="#FFFFFF" stroke="#D97706" stroke-width="3"/>
          <text x="120" y="105" font-size="16" font-weight="bold" fill="#B45309" text-anchor="middle">SCENE 1</text>

          <rect x="240" y="40" width="160" height="120" rx="14" fill="#FFFFFF" stroke="#D97706" stroke-width="3"/>
          <text x="320" y="105" font-size="16" font-weight="bold" fill="#B45309" text-anchor="middle">SCENE 2</text>

          <text x="220" y="205" font-size="16" font-weight="bold" fill="#B45309" text-anchor="middle">Spot the Difference</text>
        </svg>
      `;
    }

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgBody)}`;
  };

  const svgUri = getOfflineVideoDataUri(gameType);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <img
          src={svgUri}
          alt="Animated Game Demonstration Video"
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: pastelBg }]}>
      <Typography size="lg" weight="bold" align="center" color="#16A34A">
        Demo Animation
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 190,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
