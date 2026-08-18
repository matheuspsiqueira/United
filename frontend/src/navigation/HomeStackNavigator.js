import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import AgendaCultosScreen from '../screens/AgendaCultosScreen';
import SobreUnitedScreen from '../screens/SobreUnitedScreen';
import SobreCampusScreen from '../screens/SobreCampusScreen';
import EventosScreen from '../screens/EventosScreen';
import { COLORS, FONTS } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: COLORS.background },
        headerShadowVisible: false, // remove a linha/sombra de baixo do header
        headerTintColor: COLORS.textPrimary, // seta de voltar
        headerTitleStyle: {
          fontFamily: FONTS.displaySemiBold,
          fontSize: 16,
          color: COLORS.textPrimary,
        },
        headerBackTitleVisible: false, // iOS: esconde o texto ao lado da seta (< Eventos vira só <)
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="Noticias"
        component={NoticiasScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="SobreUnited"
        component={SobreUnitedScreen}
        options={{ headerShown: true, title: 'Sobre a United' }}
      />
      <Stack.Screen
        name="SobreCampus"
        component={SobreCampusScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Eventos"
        component={EventosScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}