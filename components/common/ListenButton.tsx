import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Typography } from './Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { voiceService } from '../../services/VoiceService';

export interface ListenButtonProps {
  textToSpeak: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  style?: any;
}

/**
 * Large, accessible Listen button designed for elderly users with limited literacy.
 * Directly reads aloud the specified text using voiceService.
 */
export const ListenButton: React.FC<ListenButtonProps> = ({
  textToSpeak,
  label = 'LISTEN',
  size = 'md',
  variant = 'secondary',
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePress = async () => {
    if (isPlaying) {
      await voiceService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await voiceService.speak(textToSpeak);
      // Reset state once done
      setTimeout(() => {
        setIsPlaying(false);
      }, Math.max(2000, textToSpeak.length * 75));
    }
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const iconSize = isSmall ? 18 : isLarge ? 26 : 22;

  const bgColors = {
    primary: '#16A34A',
    secondary: '#FEF3C7',
    outline: '#FFFFFF',
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: '#B45309',
    outline: '#16A34A',
  };

  const borderColors = {
    primary: '#15803D',
    secondary: '#FDE68A',
    outline: '#86EFAC',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Listen aloud: ${textToSpeak}`}
      onPress={handlePress}
      style={[
        styles.btnContainer,
        {
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          paddingVertical: isSmall ? 6 : isLarge ? 12 : 8,
          paddingHorizontal: isSmall ? 10 : isLarge ? 18 : 14,
        },
        style,
      ]}
    >
      {isPlaying ? (
        <VolumeX size={iconSize} color={textColors[variant]} style={{ marginRight: 6 }} />
      ) : (
        <Volume2 size={iconSize} color={textColors[variant]} style={{ marginRight: 6 }} />
      )}
      <Typography
        size={isSmall ? 'xs' : isLarge ? 'base' : 'sm'}
        weight="bold"
        color={textColors[variant]}
        style={{ letterSpacing: 0.5 }}
      >
        {isPlaying ? 'STOP' : label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
