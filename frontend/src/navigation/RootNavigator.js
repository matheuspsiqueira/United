import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeStackNavigator from './HomeStackNavigator';
import SeriesScreen from '../screens/SeriesScreen';
import BibliaScreen from '../screens/BibliaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Series: 'play-circle',
  Biblia: 'book',
  Perfil: 'person',
};

// NavigationContainer e o tema de navegação subiram pro AppNavigator.js —
// aqui fica só a definição das tabs autenticadas.
export default function RootNavigator() {
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();

  // Accent do campus do usuário logado — mesma lógica da Home: só tinge
  // o item ATIVO da nav (identidade do campus), os inativos continuam
  // neutros. Se por algum motivo o campus ainda não carregou, cai pro
  // branco padrão em vez de quebrar.
  const accent = usuario?.campus?.corTema ? getCampusAccent(usuario.campus.corTema) : null;
  const activeColor = accent ? accent.light : COLORS.textPrimary;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, size, focused }) => (
          <View
            style={[
              styles.iconWrapper,
              focused && {
                backgroundColor: accent ? accent.glow(0.16) : 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            <Ionicons name={ICONS[route.name]} size={size - 4} color={color} />
          </View>
        ),
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: COLORS.textSecondary,
        // O fundo de vidro entra por baixo do conteúdo da tab bar —
        // precisa de tabBarStyle com backgroundColor transparent pra aparecer.
        tabBarBackground: () => (
          <BlurView
            intensity={35}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          />
        ),
        tabBarStyle: [styles.tabBar, { bottom: insets.bottom + 14 }],
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Início' }} />
      <Tab.Screen name="Series" component={SeriesScreen} options={{ title: 'Séries' }} />
      <Tab.Screen name="Biblia" component={BibliaScreen} options={{ title: 'Bíblia' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 66,
    borderRadius: 24,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'transparent',
    overflow: 'hidden', // clipa o BlurView nos cantos arredondados
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    paddingTop: 8,
  },
  tabItem: {
    paddingTop: 2,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
  },
});