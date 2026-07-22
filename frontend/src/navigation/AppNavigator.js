import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import RootNavigator from './RootNavigator';
import GuestNavigator from './GuestNavigator';
import { COLORS } from '../theme/colors';

// Só pode existir um NavigationContainer na árvore. Por isso ele mora aqui,
// num nível acima do RootNavigator (autenticado) e do GuestNavigator
// (visitante) — e alterna entre os dois filhos por dentro do mesmo Container.
// Vantagem de graça: trocar de árvore assim já reseta o histórico de
// navegação sozinho (padrão recomendado pela lib pra fluxo de auth).
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
        <RootNavigator />
      ) : (
        <GuestNavigator onLoginSuccess={onLoginSuccess} />
      )}
    </NavigationContainer>
  );
}