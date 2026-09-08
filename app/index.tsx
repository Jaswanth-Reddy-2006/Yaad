import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import PatientHomeScreen from './(patient)/index';
import OnboardingScreen from './auth/index';
import { authService } from '../services/AuthService';
import { COLORS } from '../constants/theme';
import { UserRole } from '../types';

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function checkAuth() {
        try {
          const isAuth = await authService.isAuthenticated();
          const role = await authService.getUserRole();
          if (isMounted) {
            setIsAuthenticated(isAuth);
            setUserRole(role);
            setLoading(false);

            if (isAuth && role === 'CAREGIVER') {
              router.replace('/caregiver/home');
            }
          }
        } catch (err) {
          if (isMounted) {
            setIsAuthenticated(false);
            setUserRole(null);
            setLoading(false);
          }
        }
      }
      checkAuth();
      return () => {
        isMounted = false;
      };
    }, [router])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <OnboardingScreen />;
  }

  if (userRole === 'CAREGIVER') {
    return null; // Will redirect via router.replace
  }

  return <PatientHomeScreen />;
}
