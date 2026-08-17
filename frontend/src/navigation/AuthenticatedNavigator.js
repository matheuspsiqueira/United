import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './RootNavigator';
import SerieDetalheScreen from '../screens/modals/SerieDetalheScreen';

const Stack = createNativeStackNavigator();

// Fica ACIMA das tabs — aqui entram os modais de TELA CHEIA (cobrem a tab
// bar inteira, ex: detalhe de série). Modais que só cobrem o conteúdo de
// uma tab específica continuariam dentro do *StackNavigator daquela tab.
// Existe só pra isso: nenhuma outra lógica de auth mora aqui, isso
// continua sendo resolvido no AppNavigator.
export default function AuthenticatedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={RootNavigator} />
      <Stack.Screen
        name="SerieDetalhe"
        component={SerieDetalheScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}