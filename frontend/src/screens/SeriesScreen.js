import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { listarSeries } from '../services/seriesApi';

function formatarDataLancamento(dataStr) {
  const data = new Date(`${dataStr}T00:00:00`);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2);
  return `${mes}/${ano}`;
}

// Agrupa a lista flat de séries por campus, mantendo o campus do usuário
// sempre primeiro — mesmo princípio de "seu campus em destaque, resto depois"
// já usado na Home.
function agruparPorCampus(series, campusUsuarioId) {
  const grupos = new Map();

  series.forEach((serie) => {
    if (!grupos.has(serie.campus)) {
      grupos.set(serie.campus, {
        campusId: serie.campus,
        campusNome: serie.campus_nome,
        campusCorTema: serie.campus_cor_tema,
        series: [],
      });
    }
    grupos.get(serie.campus).series.push(serie);
  });

  return Array.from(grupos.values()).sort((a, b) => {
    if (a.campusId === campusUsuarioId) return -1;
    if (b.campusId === campusUsuarioId) return 1;
    return 0;
  });
}

function SerieCard({ serie, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.cardWrapper}>
      <GlassSurface style={styles.card} scrimOpacity={0.5}>
        {serie.capa ? (
          <Image source={{ uri: serie.capa }} style={styles.capa} resizeMode="cover" />
        ) : (
          <View style={[styles.capa, styles.capaPlaceholder]}>
            <Ionicons name="play" size={26} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitulo} numberOfLines={1}>
            {serie.titulo}
          </Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta}>
              {serie.quantidade_episodios} {serie.quantidade_episodios === 1 ? 'ep.' : 'eps.'}
            </Text>
            <Text style={styles.cardData}>{formatarDataLancamento(serie.data_lancamento)}</Text>
          </View>
        </View>
      </GlassSurface>
    </TouchableOpacity>
  );
}

export default function SeriesScreen({ navigation }) {
    const { usuario, token } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await listarSeries(token);
      setGrupos(agruparPorCampus(data, usuario?.campus?.id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, usuario?.campus?.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const accent = usuario?.campus?.cor_tema ? getCampusAccent(usuario.campus.cor_tema) : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, accent ? accent.glow(0.12) : COLORS.background, COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.header}>Séries</Text>

        {loading && (
          <View style={styles.centro}>
            <ActivityIndicator color={COLORS.textPrimary} />
          </View>
        )}

        {!loading && erro && (
          <View style={styles.centro}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={carregar} style={styles.retryBtn}>
              <Text style={styles.retryTexto}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !erro && (
          <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
            {grupos.length === 0 && (
              <Text style={styles.vazio}>Nenhuma série publicada ainda.</Text>
            )}

            {grupos.map((grupo) => (
              <View key={grupo.campusId} style={styles.secao}>
                <View style={styles.secaoHeader}>
                  <View style={[styles.dot, { backgroundColor: grupo.campusCorTema }]} />
                  <Text style={styles.secaoTitulo}>{grupo.campusNome}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carrossel}
                >
                  {grupo.series.map((serie) => (
                    <SerieCard
                      key={serie.id}
                      serie={serie}
                      onPress={() => navigation.getParent()?.navigate('SerieDetalhe', { serieId: serie.id })}
                    />
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const CARD_WIDTH = 152;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  header: {
    fontSize: 22,
    fontFamily: FONTS.displayBold,
    color: COLORS.textPrimary,
    marginVertical: 12,
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  erroTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center' },
  retryBtn: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryTexto: { color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium },
  vazio: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center',
    marginTop: 40,
  },
  secao: { marginBottom: 22 },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  secaoTitulo: { fontSize: 15, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  carrossel: { gap: 12, paddingRight: 4 },
  cardWrapper: { width: CARD_WIDTH },
  card: { width: CARD_WIDTH },
  capa: { width: CARD_WIDTH, height: 170 },
  cardInfo: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  cardTitulo: { fontSize: 12, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardMeta: { fontSize: 10, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary },
  cardData: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
});