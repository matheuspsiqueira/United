import React, { useCallback, useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import AppNavigator from './src/navigation/AppNavigator';
import IntroScreen from './src/screens/IntroScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { COLORS } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  // Ainda checando se existe token salvo no AsyncStorage — evita "piscar"
  // a tela de Guest antes de saber se o usuário já estava logado.
  if (loading) return null;

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  return <AppNavigator isAuthenticated={isAuthenticated} />;
}

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

  // Cor de fundo padrão da barra de navegação do Android — sem isso ela
  // fica branca por padrão do sistema e quebra o tema escuro toda vez que
  // algo abre em janela própria (ex: Modal). Roda uma vez, no boot do app.
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(COLORS.background);
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // SafeAreaProvider precisa envolver TUDO, o mais no topo possível —
  // é ele quem alimenta tanto o <SafeAreaView> (já usado nas telas) quanto
  // o hook useSafeAreaInsets() (usado no RootNavigator pra bottom nav flutuante).
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.background }} onLayout={onLayoutRootView}>
          <StatusBar style="light" />
          <AppContent />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}