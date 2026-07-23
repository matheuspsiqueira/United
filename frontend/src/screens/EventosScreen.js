import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../theme/colors';
import { EVENTOS, getCampusById, USUARIO_MOCK } from '../data/mockData';

export default function EventosScreen({ route, navigation }) {
  const campusId = route?.params?.campusId ?? USUARIO_MOCK.campusId;
  const isOutroCampus = campusId !== USUARIO_MOCK.campusId;
  const campus = getCampusById(campusId);
  const eventos = EVENTOS.filter((e) => e.campusId === campusId);

  useEffect(() => {
    navigation.setOptions({
      title: isOutroCampus ? `Eventos — ${campus.nome}` : 'Eventos',
    });
  }, [campusId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento programado no momento.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: campus.corTema }]}>
            <Text style={styles.data}>{formatarData(item.data)}</Text>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16 },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 12,
  },
  data: { fontSize: 12, fontFamily: FONTS.mono, color: COLORS.textSecondary },
  titulo: {
    fontSize: 15,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  descricao: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});