import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import GuestNavigator from './GuestNavigator';
import { COLORS } from '../theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    border: COLORS.border,
    text: COLORS.textPrimary,
  },
};

export default function AppNavigator({ isAuthenticated, onLoginSuccess }) {
  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (
        <AuthenticatedNavigator />
      ) : (
        <GuestNavigator onLoginSuccess={onLoginSuccess} />
      )}
    </NavigationContainer>
  );
}