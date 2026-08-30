import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuestHomeScreen from '../screens/guest/GuestHomeScreen';
import CampusListScreen from '../screens/guest/CampusListScreen';
import LoginScreen from '../screens/guest/LoginScreen';
import BibliaScreen from '../screens/BibliaScreen';
import SeletorBibliaScreen from '../screens/modals/SeletorBibliaScreen';
import SobreUnitedScreen from '../screens/SobreUnitedScreen';
import SobreCampusScreen from '../screens/SobreCampusScreen';
import { COLORS, FONTS } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Bíblia, Sobre a United e Sobre o Campus são as MESMAS telas usadas no app
// autenticado — nenhum conteúdo especial de visitante nelas, só reaproveitando.
// SobreCampusScreen aceita campusId por parâmetro, então serve tanto pro
// campus do usuário logado quanto pro campus que o visitante escolheu na lista.
// Só Login e CampusList são exclusivos de quem não está logado.
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
        name="SeletorBiblia"
        component={SeletorBibliaScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
      />
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
        name="SobreCampus"
        component={SobreCampusScreen}
        options={{ title: '' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
    </Stack.Navigator>
  );
}