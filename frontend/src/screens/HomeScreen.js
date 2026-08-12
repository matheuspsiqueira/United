import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import { getCampuses, getProximoCulto } from '../services/campusApi';
import { EVENTOS, SERIES, USUARIO_MOCK } from '../data/mockData';

export default function HomeScreen({ navigation }) {
  const campusAtualId = USUARIO_MOCK.campusId;

  const [campuses, setCampuses] = useState([]);
  const [proximoCulto, setProximoCulto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    Promise.all([getCampuses(), getProximoCulto(campusAtualId)])
      .then(([listaCampuses, culto]) => {
        setCampuses(listaCampuses);
        setProximoCulto(culto);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [campusAtualId]);

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

  if (erro) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.erroText}>Não foi possível carregar a Home.</Text>
        <TouchableOpacity onPress={carregar} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar de novo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const campus = campuses.find((c) => c.id === campusAtualId);
  if (!campus) return null; // campus do usuário ainda não está na lista retornada

  // Accent derivado da corTema do campus do usuário — só usado nos
  // elementos que representam ESTE campus (hero, tag, CTA, eventos/série
  // dele). Não propagar pra conteúdo de outros campi.
  const accent = getCampusAccent(campus.corTema);

  const outrosCampuses = campuses.filter((c) => c.id !== campusAtualId);

  // TODO BACKEND: EVENTOS e SERIES ainda são mock — filtram por campusId
  // como string ('pechincha'). Precisam migrar pro app `conteudo` e passar
  // a usar o id inteiro real assim que os serializers existirem.
  const eventosDoCampus = EVENTOS.filter((e) => e.campusId === 'pechincha');
  const serieDestaque = SERIES.find((s) => s.campusId === 'pechincha');

  return (
    <View style={styles.root}>
      {/* Degradê sutil de fundo — substitui o fundo chapado */}
      <LinearGradient
        colors={[COLORS.backgroundGlowTop, COLORS.background, COLORS.backgroundGlowBottom]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.campusLabelRow}>
                <View style={[styles.dot, { backgroundColor: accent.base }]} />
                <Text style={styles.campusLabel}>SEU CAMPUS</Text>
              </View>
              <Text style={styles.headerCampus}>{campus.nome}</Text>
            </View>
            <View style={styles.headerIcons}>
              <GlassIconButton>
                <Ionicons name="search" size={20} color={COLORS.textPrimary} />
              </GlassIconButton>
            </View>
          </View>

          {/* Hero — Próximo culto */}
          {proximoCulto && (
            <LinearGradient
              colors={[accent.glow(0.75), accent.glow(0.2), 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBorder}
            >
              <BlurView intensity={40} tint="dark" style={styles.heroInner}>
                <View style={styles.heroEyebrowRow}>
                  <Ionicons name="time-outline" size={13} color={accent.light} />
                  <Text style={[styles.heroEyebrow, { color: accent.light }]}>PRÓXIMO CULTO</Text>
                </View>
                <Text style={styles.heroTitle}>
                  {formatarData(proximoCulto.data)} às {proximoCulto.hora}
                </Text>
                <Text style={styles.heroSub}>Templo {campus.nome}</Text>
                <TouchableOpacity
                  style={[styles.heroCta, { backgroundColor: accent.base }]}
                  onPress={() => navigation.navigate('SobreCampus')}
                >
                  <Text style={[styles.heroCtaText, { color: accent.textOnAccent }]}>
                    Ver detalhes
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={accent.textOnAccent} />
                </TouchableOpacity>
              </BlurView>
            </LinearGradient>
          )}

          {/* Próximos eventos */}
          {eventosDoCampus.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Próximos eventos</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {eventosDoCampus.map((evento) => (
                  <BlurView key={evento.id} intensity={25} tint="dark" style={styles.eventoCard}>
                    <Text style={[styles.eventoData, { color: accent.light }]}>
                      {formatarData(evento.data)}
                    </Text>
                    <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                    <Text style={styles.eventoDescricao} numberOfLines={2}>
                      {evento.descricao}
                    </Text>
                  </BlurView>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Em destaque — série */}
          {serieDestaque && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Em destaque</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Series')}>
                <BlurView intensity={25} tint="dark" style={styles.destaqueCard}>
                  <View style={[styles.destaqueCapa, { backgroundColor: accent.glow(0.18) }]}>
                    <Ionicons name="play" size={26} color={accent.light} />
                  </View>
                  <View style={styles.destaqueInfo}>
                    <Text style={[styles.destaqueMes, { color: accent.light }]}>
                      {serieDestaque.mes}
                    </Text>
                    <Text style={styles.destaqueTitulo}>{serieDestaque.titulo}</Text>
                    <Text style={styles.destaqueEpisodios}>
                      {serieDestaque.episodios.length} episódios
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}

          {/* Acesso rápido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acesso rápido</Text>
            <View style={styles.gridContainer}>
              <AcessoRapidoItem
                icon="play-circle-outline"
                label="Séries"
                onPress={() => navigation.getParent()?.navigate('Series')}
              />
              <AcessoRapidoItem
                icon="newspaper-outline"
                label="Notícias"
                onPress={() => navigation.navigate('Noticias')}
              />
              <AcessoRapidoItem
                icon="megaphone-outline"
                label="Eventos"
                onPress={() => navigation.navigate('Eventos')}
              />
              <AcessoRapidoItem
                icon="book-outline"
                label="Bíblia"
                onPress={() => navigation.getParent()?.navigate('Biblia')}
              />
              <AcessoRapidoItem
                icon="location-outline"
                label="Sobre o Campus"
                onPress={() => navigation.navigate('SobreCampus')}
              />
              <AcessoRapidoItem
                icon="information-circle-outline"
                label="Sobre a United"
                onPress={() => navigation.navigate('SobreUnited')}
              />
            </View>
          </View>

          {/* Explorar outros campi */}
          {outrosCampuses.length > 0 && (
            <View style={styles.exploreSection}>
              <Text style={styles.exploreLabel}>Explorar outros campi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {outrosCampuses.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.chip}
                    onPress={() => navigation.navigate('SobreCampus', { campusId: c.id })}
                  >
                    <View style={[styles.chipDot, { backgroundColor: c.corTema }]} />
                    <Text style={styles.chipText}>{c.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GlassIconButton({ children, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <BlurView intensity={30} tint="dark" style={styles.iconButton}>
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}

function AcessoRapidoItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.gridItemWrapper}>
      <BlurView intensity={25} tint="dark" style={styles.gridItem}>
        <Ionicons name={icon} size={24} color={COLORS.textPrimary} />
        <Text style={styles.gridItemLabel}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  erroText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, marginBottom: 12 },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  retryText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  campusLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  campusLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  headerCampus: { fontSize: 20, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassFill,
  },

  heroBorder: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 1,
  },
  heroInner: {
    borderRadius: 23,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.glassFill,
  },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  heroEyebrow: { fontSize: 11, fontFamily: FONTS.mono, letterSpacing: 1 },
  heroTitle: {
    fontSize: 22,
    fontFamily: FONTS.displayBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  heroCta: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  heroCtaText: { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  eventoCard: {
    width: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 14,
    marginRight: 10,
    overflow: 'hidden',
  },
  eventoData: { fontSize: 12, fontFamily: FONTS.mono },
  eventoTitulo: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  eventoDescricao: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  destaqueCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  destaqueCapa: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destaqueInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  destaqueMes: { fontSize: 11, fontFamily: FONTS.mono },
  destaqueTitulo: {
    fontSize: 15,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  destaqueEpisodios: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItemWrapper: { width: '48%', marginBottom: 12 },
  gridItem: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridItemLabel: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },

  exploreSection: { marginTop: 20, marginBottom: 24, paddingLeft: 16 },
  exploreLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  chipText: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },
});