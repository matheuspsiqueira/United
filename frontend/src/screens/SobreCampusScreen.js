import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { getCampus } from '../services/campusApi';
import { useAuth } from '../contexts/AuthContext';
const SCREEN_PADDING = 16;

const REDE_SOCIAL_ICONS = {
  instagram: { family: 'ionicons', name: 'logo-instagram' },
  youtube: { family: 'ionicons', name: 'logo-youtube' },
  spotify: { family: 'fa5', name: 'spotify' },
};

function IconeRedeSocial({ plataforma, size, color }) {
  const icone = REDE_SOCIAL_ICONS[plataforma];
  if (!icone) return <Ionicons name="link-outline" size={size} color={color} />;
  if (icone.family === 'fa5') return <FontAwesome5 name={icone.name} size={size} color={color} />;
  return <Ionicons name={icone.name} size={size} color={color} />;
}

export default function SobreCampusScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const meuCampusId = usuario?.campus?.id;
  const campusId = route?.params?.campusId ?? meuCampusId;

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

  useEffect(() => {
    if (campus) {
      navigation.setOptions({ title: 'Sobre o Campus' });
    }
  }, [campus, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['left', 'right']}>
        <ActivityIndicator color={COLORS.textPrimary} />
      </SafeAreaView>
    );
  }

  if (erro || !campus) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['left', 'right']}>
        <Text style={styles.erroText}>Não foi possível carregar o campus.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar de novo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const accent = getCampusAccent(campus.corTema);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, COLORS.background, accent.glow(0.14)]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.pastorSection}>
            <Text style={styles.pastorLabel}>{campus.tituloPastoral}</Text>
            <View style={styles.pastoresRow}>
              {campus.pastores.map((pastor) => (
                <View key={pastor.id} style={styles.pastorItem}>
                  <View style={[styles.pastorAvatar, { borderColor: accent.base }]}>
                    {pastor.foto ? (
                      <Image source={{ uri: pastor.foto }} style={styles.pastorAvatarImg} />
                    ) : (
                      <Ionicons name="person" size={32} color={COLORS.textSecondary} />
                    )}
                  </View>
                  <Text style={styles.pastorNome}>{pastor.nome}</Text>
                </View>
              ))}
            </View>
          </View>

          <GlassSurface intensity={25} style={[styles.infoCard, { borderLeftColor: accent.base }]}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={accent.light} />
              <Text style={styles.infoText}>{campus.endereco}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={accent.light} />
              <Text style={styles.infoText}>Campus fundado em {campus.anoFundacao}</Text>
            </View>
          </GlassSurface>

          {!!campus.descricao && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nossa história</Text>
              <GlassSurface intensity={25} style={styles.descricaoCard}>
                <Text style={styles.descricaoText}>{campus.descricao}</Text>
              </GlassSurface>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horários de culto</Text>
            <GlassSurface intensity={25} style={styles.horariosCard}>
              {campus.horarios.map((h, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.horarioRow,
                    idx < campus.horarios.length - 1 && styles.horarioRowDivider,
                  ]}
                >
                  <View>
                    <Text style={styles.horarioNome}>{h.nome || h.dia}</Text>
                    <Text style={styles.horarioDia}>{h.dia}</Text>
                  </View>
                  <Text style={[styles.horarioHora, { color: accent.light }]}>{h.hora}</Text>
                </View>
              ))}
            </GlassSurface>
          </View>

          {campus.redesSociais?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Redes sociais</Text>
              <View style={styles.redesRow}>
                {campus.redesSociais.map((r) => (
                  <TouchableOpacity key={r.plataforma} onPress={() => Linking.openURL(r.url)}>
                    <GlassSurface intensity={25} style={styles.redeItem}>
                      <IconeRedeSocial plataforma={r.plataforma} size={22} color={accent.light} />
                    </GlassSurface>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  erroText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, marginBottom: 12 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface, borderRadius: 8 },
  retryText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },

  content: { padding: SCREEN_PADDING, paddingBottom: 140 },

  pastorSection: { alignItems: 'center', paddingVertical: 20 },
  pastorLabel: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  pastoresRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  pastorItem: { alignItems: 'center', marginHorizontal: 12, marginBottom: 10 },
  pastorAvatar: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.glassFill, overflow: 'hidden',
  },
  pastorAvatarImg: { width: '100%', height: '100%' },
  pastorNome: {
    fontSize: 13, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary,
    marginTop: 10, textAlign: 'center', maxWidth: 110,
  },

  infoCard: { marginTop: 6, borderLeftWidth: 3, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary, marginLeft: 10, flex: 1 },

  section: { marginTop: 26 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  descricaoCard: { padding: 16 },
  descricaoText: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, lineHeight: 20 },

  horariosCard: { paddingHorizontal: 16 },
  horarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  horarioRowDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  horarioNome: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  horarioDia: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  horarioHora: { fontSize: 14, fontFamily: FONTS.mono },

  redesRow: { flexDirection: 'row', gap: 12 },
  redeItem: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});