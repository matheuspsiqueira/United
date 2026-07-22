import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS } from '../theme/colors';
import { NOTICIAS } from '../data/mockData';

export default function NoticiasScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {NOTICIAS.map((noticia) => (
        <View key={noticia.id} style={styles.card}>
          <Text style={styles.data}>{noticia.data}</Text>
          <Text style={styles.titulo}>{noticia.titulo}</Text>
          <Text style={styles.resumo}>{noticia.resumo}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12 },
  data: { fontSize: 11, color: COLORS.textSecondary },
  titulo: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
  resumo: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
});
