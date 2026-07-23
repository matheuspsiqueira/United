import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import AgendaCultosScreen from '../screens/AgendaCultosScreen';
import SobreUnitedScreen from '../screens/SobreUnitedScreen';
import SobreCampusScreen from '../screens/SobreCampusScreen';
import EventosScreen from '../screens/EventosScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="Noticias"
        component={NoticiasScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="AgendaCultos"
        component={AgendaCultosScreen}
        options={{ headerShown: true, title: 'Agenda de Cultos' }}
      />
      <Stack.Screen
        name="SobreUnited"
        component={SobreUnitedScreen}
        options={{ headerShown: true, title: 'Sobre a United' }}
      />
      <Stack.Screen
        name="SobreCampus"
        component={SobreCampusScreen}
        options={{ headerShown: true, title: 'Sobre o Campus' }}
      />
      <Stack.Screen
        name="Eventos"
        component={EventosScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}