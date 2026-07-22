import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeStackNavigator from './HomeStackNavigator';
import SeriesScreen from '../screens/SeriesScreen';
import BibliaScreen from '../screens/BibliaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { COLORS } from '../theme/colors';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Series" component={SeriesScreen} options={{ title: 'Séries' }} />
      <Tab.Screen name="Biblia" component={BibliaScreen} options={{ title: 'Bíblia' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}