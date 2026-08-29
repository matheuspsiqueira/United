import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuestHomeScreen from '../screens/guest/GuestHomeScreen';
import CampusListScreen from '../screens/guest/CampusListScreen';
import CampusDetailScreen from '../screens/guest/CampusDetailScreen';
import LoginScreen from '../screens/guest/LoginScreen';
import BibliaScreen from '../screens/BibliaScreen';
import SobreUnitedScreen from '../screens/guest/CampusDetailScreen';
import { COLORS, FONTS } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Bíblia e Sobre a United são as MESMAS telas usadas no app autenticado —
// nenhum conteúdo especial de visitante nelas, só reaproveitando.
export default function GuestNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontFamily: FONTS.bodySemiBold },
      }}
    >
      <Stack.Screen
        name="GuestHome"
        component={GuestHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Biblia" component={BibliaScreen} options={{ title: 'Bíblia' }} />
      <Stack.Screen
        name="SobreUnited"
        component={SobreUnitedScreen}
        options={{ title: 'Sobre a United' }}
      />
      <Stack.Screen
        name="CampusList"
        component={CampusListScreen}
        options={{ title: 'Encontre um campus' }}
      />
      <Stack.Screen
        name="CampusDetail"
        component={CampusDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
    </Stack.Navigator>
  );
}