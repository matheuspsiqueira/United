import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './RootNavigator';
import SerieDetalheScreen from '../screens/modals/SerieDetalheScreen';
import EventoDetalheScreen from '../screens/modals/EventoDetalheScreen';
import NoticiaDetalheScreen from '../screens/modals/NoticiaDetalheScreen';
import VersiculosFavoritosScreen from '../screens/modals/VersiculosFavoritosScreen';
import EditarDadosPessoaisScreen from '../screens/modals/EditarDadosPessoaisScreen';
import UnitedNewsPlayerScreen from '../screens/modals/UnitedNewsPlayerScreen';
import SeletorBibliaScreen from '../screens/modals/SeletorBibliaScreen';

const Stack = createNativeStackNavigator();

export default function AuthenticatedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={RootNavigator} />
      <Stack.Screen
        name="SerieDetalhe"
        component={SerieDetalheScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="EventoDetalhe"
        component={EventoDetalheScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="NoticiaDetalhe"
        component={NoticiaDetalheScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="VersiculosFavoritos"
        component={VersiculosFavoritosScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="EditarDadosPessoais"
        component={EditarDadosPessoaisScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="UnitedNewsPlayer"
        component={UnitedNewsPlayerScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="SeletorBiblia"
        component={SeletorBibliaScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}