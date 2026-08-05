import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampus } from '../services/campusApi';
import { USUARIO_MOCK } from '../data/mockData'; // TODO BACKEND: sai quando auth entrar

export default function SobreCampusScreen({ route, navigation }) {
  const campusId = route?.params?.campusId ?? USUARIO_MOCK.campusId;
  const isOutroCampus = campusId !== USUARIO_MOCK.campusId;

  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    getCampus(campusId)
      .then(setCampus)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [campusId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator color={COLORS.textPrimary} />
      </SafeAreaView>
    );
  }

  if (erro || !campus) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.erroText}>Não foi possível carregar o campus.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar de novo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.pastorLabel}>
          {campus.pastores.length > 1 ? 'Pastores' : 'Pastor'}
        </Text>
        <View style={styles.pastoresRow}>
          {campus.pastores.map((pastor) => (
            <View key={pastor.id} style={styles.pastorItem}>
              <View style={[styles.pastorAvatar, { borderColor: campus.corTema }]}>
                {pastor.foto ? (
                  <Image source={{ uri: pastor.foto }} style={styles.pastorAvatarImg} />
                ) : (
                  <Ionicons name="person" size={28} color={COLORS.textSecondary} />
                )}
              </View>
              <Text style={styles.pastorNome}>{pastor.nome}</Text>
            </View>
          ))}
        </View>

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
  centered: { justifyContent: 'center', alignItems: 'center' },
  erroText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, marginBottom: 12 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface, borderRadius: 8 },
  retryText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },

  content: { padding: 16, alignItems: 'center' },
  pastorLabel: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 8 },
  pastoresRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  pastorItem: { alignItems: 'center', marginHorizontal: 10, marginBottom: 8 },
  pastorAvatar: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated, overflow: 'hidden',
  },
  pastorAvatarImg: { width: '100%', height: '100%' },
  pastorNome: {
    fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    marginTop: 6, textAlign: 'center', maxWidth: 100,
  },

  infoCard: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 12,
    borderLeftWidth: 3, padding: 14, marginTop: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary, marginLeft: 8, flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginVertical: 20 },
  horariosLabel: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginBottom: 8, alignSelf: 'flex-start' },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
  horarioDia: { fontSize: 14, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },
  horarioHora: { fontSize: 14, fontFamily: FONTS.mono, color: COLORS.textPrimary },

  explorarGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  explorarItem: { width: '48%', backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
  explorarLabel: { marginTop: 8, fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
});