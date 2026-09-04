import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    async function checkAuth() {
      try {
        const isAuth = await authService.isAuthenticated();
        const role = await authService.getUserRole();
        setIsAuthenticated(isAuth);
        setUserRole(role);

        if (isAuth && role === 'CAREGIVER') {
          router.replace('/caregiver/home');
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

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
