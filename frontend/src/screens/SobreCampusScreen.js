import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusById, USUARIO_MOCK } from '../data/mockData';

// Tela genérica: recebe campusId via route.params.
// Sem params (ex: acesso rápido do próprio usuário), cai no campus do usuário.
export default function SobreCampusScreen({ route, navigation }) {
  const campusId = route?.params?.campusId ?? USUARIO_MOCK.campusId;
  const isOutroCampus = campusId !== USUARIO_MOCK.campusId;
  const campus = getCampusById(campusId);

  if (!campus) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.fotoWrapper, { borderColor: campus.corTema }]}>
          <Ionicons name="people" size={40} color={campus.corTema} />
        </View>

        <Text style={styles.pastorLabel}>
          {campus.pastores.length > 1 ? 'Pastores' : 'Pastor'}
        </Text>
        <Text style={styles.pastorNome}>{campus.pastores.join(' & ')}</Text>

        <View style={[styles.infoCard, { borderLeftColor: campus.corTema }]}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{campus.endereco}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Campus fundado em {campus.anoFundacao}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.horariosLabel}>Horários de culto</Text>
        {campus.horarios.map((h, idx) => (
          <View key={idx} style={styles.horarioRow}>
            <Text style={styles.horarioDia}>{h.dia}</Text>
            <Text style={styles.horarioHora}>{h.hora}</Text>
          </View>
        ))}

        {/* Só aparece quando o usuário está explorando um campus que não é o dele */}
        {isOutroCampus && (
          <>
            <View style={styles.divider} />
            <Text style={styles.horariosLabel}>Explorar mais sobre {campus.nome}</Text>
            <View style={styles.explorarGrid}>
              <TouchableOpacity
                style={styles.explorarItem}
                onPress={() => navigation.navigate('Eventos', { campusId })}
              >
                <Ionicons name="megaphone-outline" size={22} color={COLORS.textPrimary} />
                <Text style={styles.explorarLabel}>Eventos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.explorarItem}
                onPress={() => navigation.navigate('Noticias', { campusId })}
              >
                <Ionicons name="newspaper-outline" size={22} color={COLORS.textPrimary} />
                <Text style={styles.explorarLabel}>Notícias</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, alignItems: 'center' },
  fotoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    marginTop: 8,
  },
  pastorLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  pastorNome: {
    fontSize: 18,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 14,
    marginTop: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  divider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginVertical: 20 },
  horariosLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  horarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  horarioDia: { fontSize: 14, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },
  horarioHora: { fontSize: 14, fontFamily: FONTS.mono, color: COLORS.textPrimary },

  explorarGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  explorarItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  explorarLabel: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
});