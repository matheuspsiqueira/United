import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS } from '../theme/colors';
import { SOBRE_UNITED, CAMPUSES } from '../data/mockData';

export default function SobreUnitedScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Section title="Visão">
        <Text style={styles.text}>{SOBRE_UNITED.visao}</Text>
      </Section>
      <Section title="Missão">
        <Text style={styles.text}>{SOBRE_UNITED.missao}</Text>
      </Section>
      <Section title="História">
        <Text style={styles.text}>{SOBRE_UNITED.historia}</Text>
      </Section>
      <Section title="Redes sociais">
        <Text style={styles.text}>Instagram: {SOBRE_UNITED.redes.instagram}</Text>
        <Text style={styles.text}>YouTube: {SOBRE_UNITED.redes.youtube}</Text>
        <Text style={styles.text}>Spotify: {SOBRE_UNITED.redes.spotify}</Text>
      </Section>
      <Section title="Todos os campi">
        {CAMPUSES.map((c) => (
          <View key={c.id} style={styles.campusRow}>
            <View style={[styles.dot, { backgroundColor: c.corTema }]} />
            <Text style={styles.text}>{c.nome} — {c.regiao}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  text: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  campusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
});
