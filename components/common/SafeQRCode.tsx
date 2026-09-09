import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface SafeQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

interface SafeQRCodeState {
  hasError: boolean;
  errorMessage: string;
}

export class SafeQRCode extends Component<SafeQRCodeProps, SafeQRCodeState> {
  constructor(props: SafeQRCodeProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): SafeQRCodeState {
    return { hasError: true, errorMessage: error.message || 'QR code too large' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[SafeQRCode] Error rendering QR Code:', error.message, errorInfo);
  }

  componentDidUpdate(prevProps: SafeQRCodeProps) {
    if (prevProps.value !== this.props.value && this.state.hasError) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  render(): ReactNode {
    const { value, size = 200, color = '#0F172A', backgroundColor = '#FFFFFF' } = this.props;

    // Hard safety guard: standard QR codes cannot encode > 2000 bytes reliably
    if (this.state.hasError || !value || value.length > 2000) {
      return (
        <View style={[styles.fallbackContainer, { width: size, height: size }]}>
          <Text style={styles.fallbackTitle}>Payload Too Large for QR</Text>
          <Text style={styles.fallbackText}>
            Use 1-Tap Nearby Sync to transfer all media and large data.
          </Text>
        </View>
      );
    }

    try {
      return (
        <QRCode
          value={value}
          size={size}
          color={color}
          backgroundColor={backgroundColor}
        />
      );
    } catch {
      return (
        <View style={[styles.fallbackContainer, { width: size, height: size }]}>
          <Text style={styles.fallbackTitle}>QR Code Error</Text>
          <Text style={styles.fallbackText}>
            Please use Nearby Sync to transfer data.
          </Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 16,
  },
});
