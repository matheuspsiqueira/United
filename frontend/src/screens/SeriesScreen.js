import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';
import { SERIES, getCampusById } from '../data/mockData';

export default function SeriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Séries</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {SERIES.map((serie) => {
          const campus = getCampusById(serie.campusId);
          return (
            <TouchableOpacity key={serie.id} style={styles.card}>
              <View style={[styles.capa, { backgroundColor: campus.corTema }]}>
                <Ionicons name="play" size={30} color="#FFF" />
              </View>
              <View style={styles.info}>
                <Text style={styles.campusTag}>{campus.nome}</Text>
                <Text style={styles.titulo}>{serie.titulo}</Text>
                <Text style={styles.mes}>{serie.mes}</Text>
                <Text style={styles.episodios}>{serie.episodios.length} episódios</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  capa: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  campusTag: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase' },
  titulo: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  mes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  episodios: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
