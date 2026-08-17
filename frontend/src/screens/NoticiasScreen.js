import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { listarNoticias, listarUnitedNews } from '../services/conteudoApi';

function UnitedNewsCard({ unitedNews, accent, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <GlassSurface style={[styles.unitedCard, { borderColor: accent.glow(0.5) }]} scrimOpacity={0.35}>
        {unitedNews.capa ? (
          <Image source={{ uri: unitedNews.capa }} style={styles.unitedThumb} />
        ) : (
          <View style={[styles.unitedThumb, styles.unitedThumbFallback]} />
        )}
        <View style={styles.unitedOverlay}>
          <View style={[styles.playButton, { backgroundColor: accent.base }]}>
            <Text style={[styles.playIcon, { color: accent.textOnAccent }]}>▶</Text>
          </View>
        </View>
        <View style={styles.unitedFooter}>
          <Text style={[styles.unitedTag, { color: accent.light }]}>UNITED NEWS</Text>
          <Text style={styles.unitedMes}>{unitedNews.mes_referencia}</Text>
        </View>
      </GlassSurface>
    </TouchableOpacity>
  );
}

export default function NoticiasScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario, token } = useAuth();

  const campusId = route?.params?.campusId ?? usuario?.campus?.id;
  const isOutroCampus = campusId !== usuario?.campus?.id;
  const campusNome = route?.params?.campusNome ?? usuario?.campus?.nome;
  const corTema = isOutroCampus
    ? route?.params?.corTema ?? usuario?.campus?.corTema
    : usuario?.campus?.corTema;
  const accent = getCampusAccent(corTema ?? '#9B8AD9');

  const [noticias, setNoticias] = useState([]);
  const [unitedNews, setUnitedNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    if (!campusId) return;
    setLoading(true);
    setErro(null);
    try {
      const [noticiasRes, unitedNewsRes] = await Promise.all([
        listarNoticias(token, campusId),
        listarUnitedNews(token, campusId),
      ]);
      setNoticias(noticiasRes.results ?? noticiasRes);
      setUnitedNews(unitedNewsRes);
    } catch (e) {
      setErro('Não foi possível carregar as notícias. Puxe pra atualizar.');
    } finally {
      setLoading(false);
    }
  }, [campusId, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    navigation.setOptions({
      title: isOutroCampus ? `Notícias — ${campusNome}` : 'Notícias',
    });
  }, [campusId]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, 'transparent']}
        style={styles.gradientTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', accent.glow(0.14)]}
        style={styles.gradientBottom}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 130 }}
      >
        {loading ? (
          <ActivityIndicator color={accent.base} style={{ marginTop: 40 }} />
        ) : erro ? (
          <GlassSurface style={styles.erroCard}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={carregar} style={[styles.retryBtn, { backgroundColor: accent.base }]}>
              <Text style={[styles.retryTexto, { color: accent.textOnAccent }]}>Tentar de novo</Text>
            </TouchableOpacity>
          </GlassSurface>
        ) : (
          <>
            {unitedNews && (
              <UnitedNewsCard
                unitedNews={unitedNews}
                accent={accent}
                onPress={() => navigation.getParent()?.getParent()?.navigate('UnitedNewsPlayer', { unitedNews })}
              />
            )}

            {noticias.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma notícia por aqui ainda.</Text>
            ) : (
              noticias.map((noticia) => (
                <TouchableOpacity
                  key={noticia.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.getParent()?.getParent()?.navigate('NoticiaDetalhe', { noticia })}
                >
                  <GlassSurface style={styles.card}>
                    <Text style={styles.data}>{noticia.data}</Text>
                    <Text style={styles.titulo}>{noticia.titulo}</Text>
                    <Text style={styles.resumo} numberOfLines={2}>
                      {noticia.conteudo}
                    </Text>
                  </GlassSurface>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  erroCard: { padding: 20, alignItems: 'center', gap: 12 },
  erroTexto: { fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  retryTexto: { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  unitedCard: { marginBottom: 20, overflow: 'hidden' },
  unitedThumb: { width: '100%', height: 180 },
  unitedThumbFallback: { backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  unitedOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 18, marginLeft: 3 },
  unitedFooter: { padding: 14 },
  unitedTag: { fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1 },
  unitedMes: { fontFamily: FONTS.displaySemiBold, fontSize: 16, color: COLORS.textPrimary, marginTop: 2 },

  card: { padding: 14, marginBottom: 12 },
  data: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textSecondary },
  titulo: { fontSize: 16, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary, marginTop: 4 },
  resumo: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 6 },
});