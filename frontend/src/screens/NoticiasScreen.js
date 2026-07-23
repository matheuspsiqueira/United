import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS, FONTS } from '../theme/colors';
import { NOTICIAS, getCampusById, USUARIO_MOCK } from '../data/mockData';

export default function NoticiasScreen({ route, navigation }) {
  const campusId = route?.params?.campusId ?? USUARIO_MOCK.campusId;
  const isOutroCampus = campusId !== USUARIO_MOCK.campusId;
  const campus = getCampusById(campusId);
  const noticias = NOTICIAS.filter((n) => n.campusId === campusId);

  useEffect(() => {
    navigation.setOptions({
      title: isOutroCampus ? `Notícias — ${campus.nome}` : 'Notícias',
    });
  }, [campusId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {noticias.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma notícia por aqui ainda.</Text>
      ) : (
        noticias.map((noticia) => (
          <View key={noticia.id} style={styles.card}>
            <Text style={styles.data}>{noticia.data}</Text>
            <Text style={styles.titulo}>{noticia.titulo}</Text>
            <Text style={styles.resumo}>{noticia.resumo}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12 },
  data: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textSecondary },
  titulo: { fontSize: 16, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary, marginTop: 4 },
  resumo: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 6 },
});