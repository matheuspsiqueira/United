import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS, FONTS } from '../../theme/colors';
import { getCampusById } from '../../data/mockData';

export default function CampusDetailScreen({ route, navigation }) {
  const { campusId } = route.params;
  const campus = getCampusById(campusId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: campus?.nome ?? 'Campus' });
  }, [campus, navigation]);

  if (!campus) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={[styles.spine, { backgroundColor: campus.corTema }]} />
      <Text style={styles.nome}>{campus.nome}</Text>
      <Text style={styles.endereco}>{campus.endereco}</Text>

      <Text style={styles.sectionLabel}>Pastores</Text>
      {campus.pastores.map((p) => (
        <Text key={p} style={styles.pastor}>
          {p}
        </Text>
      ))}

      <Text style={styles.sectionLabel}>Horários de culto</Text>
      {campus.horarios.map((h, idx) => (
        <View key={idx} style={styles.horarioRow}>
          <Text style={styles.dia}>{h.dia}</Text>
          <Text style={styles.hora}>{h.hora}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  spine: { height: 4, borderRadius: 2, marginBottom: 16, width: 48 },
  nome: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  endereco: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
  },
  pastor: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  horarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  dia: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textPrimary },
  hora: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textSecondary },
});