import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { SERIES, getCampusById } from '../data/mockData';

export default function SeriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Séries</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {SERIES.map((serie) => {
          const campus = getCampusById(serie.campusId);
          return (
            <TouchableOpacity
              key={serie.id}
              style={[styles.card, { borderLeftColor: campus.corTema }]}
            >
              <View style={styles.capa}>
                <Ionicons name="play" size={30} color={campus.corTema} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.campusTag, { color: campus.corTema }]}>
                  {campus.nome}
                </Text>
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
  header: {
    fontSize: 22,
    fontFamily: FONTS.displayBold,
    color: COLORS.textPrimary,
    marginVertical: 12,
  },
  // Channel spine: barra lateral fina na cor do campus, mesmo tratamento
  // usado no card "Em destaque" da Home.
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  capa: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  campusTag: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    textTransform: 'uppercase',
  },
  titulo: {
    fontSize: 16,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  mes: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  episodios: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});