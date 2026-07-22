import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import AppNavigator from './src/navigation/AppNavigator';
import IntroScreen from './src/screens/IntroScreen';
import { COLORS } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
  });

  const [showIntro, setShowIntro] = useState(true);

  // MOCK: sem backend ainda, então o estado de login vive só aqui.
  // LoginScreen chama onLoginSuccess -> isAuthenticated vira true ->
  // AppNavigator troca o GuestNavigator pelo RootNavigator (tabs reais).
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      {showIntro ? (
        <IntroScreen onFinish={() => setShowIntro(false)} />
      ) : (
        <AppNavigator
          isAuthenticated={isAuthenticated}
          onLoginSuccess={() => setIsAuthenticated(true)}
        />
      )}
    </View>
  );
}