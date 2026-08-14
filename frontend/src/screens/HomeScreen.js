import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { getCampuses, getProximoCulto } from '../services/campusApi';
import { listarEventos } from '../services/eventosApi';
import { SERIES } from '../data/mockData';
import EventoDetalheModal from './modals/EventoDetalheModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const EVENTO_GAP = 12;
const EVENTO_CARD_SIZE = (SCREEN_WIDTH - SCREEN_PADDING * 2 - EVENTO_GAP) / 2;

// Degradê decorativo só pra eventos SEM foto de capa cadastrada.
const PLACEHOLDER_GRADIENTS = [
  ['#4FA6A0', '#26215C'],
  ['#D97C86', '#3C3489'],
  ['#3C3489', '#712B13'],
];

export default function HomeScreen({ navigation }) {
  const { usuario, token } = useAuth();
  const campusAtualId = usuario?.campus?.id;

  const [campuses, setCampuses] = useState([]);
  const [proximoCulto, setProximoCulto] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    Promise.all([getCampuses(), getProximoCulto(campusAtualId), listarEventos(token)])
      .then(([listaCampuses, culto, listaEventos]) => {
        setCampuses(listaCampuses);
        setProximoCulto(culto);
        setEventos(listaEventos);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [campusAtualId, token]);

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
  if (!campus) return null;

  const accent = getCampusAccent(campus.corTema);
  const outrosCampuses = campuses.filter((c) => c.id !== campusAtualId);

  // Eventos reais, só do campus do usuário logado.
  const eventosDoCampus = eventos.filter((e) => e.campus.id === campusAtualId);

  // TODO BACKEND: SERIES ainda é mock — mesma ponte temporária por slug
  // usada antes; some quando o app `conteudo` migrar Séries pra API.
  const campusSlug = campus.nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
  const serieDestaque = SERIES.find((s) => s.campusId === campusSlug);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, COLORS.background, accent.glow(0.14)]}
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
              <GlassSurface intensity={40} style={styles.heroInner}>
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
                  onPress={() => navigation.navigate('SobreCampus', { campusId: campus.id })}
                >
                  <Text style={[styles.heroCtaText, { color: accent.textOnAccent }]}>
                    Ver detalhes
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={accent.textOnAccent} />
                </TouchableOpacity>
              </GlassSurface>
            </LinearGradient>
          )}

          {/* Acesso rápido — quadrados pequenos, rolagem lateral */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acesso rápido</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScrollContent}
            >
              <AcessoRapidoItem
                icon="play-circle-outline"
                label="Séries"
                accent={accent}
                onPress={() => navigation.getParent()?.navigate('Series')}
              />
              <AcessoRapidoItem
                icon="newspaper-outline"
                label="Notícias"
                accent={accent}
                onPress={() => navigation.navigate('Noticias')}
              />
              <AcessoRapidoItem
                icon="megaphone-outline"
                label="Eventos"
                accent={accent}
                onPress={() => navigation.navigate('Eventos')}
              />
              <AcessoRapidoItem
                icon="book-outline"
                label="Bíblia"
                accent={accent}
                onPress={() => navigation.getParent()?.navigate('Biblia')}
              />
              <AcessoRapidoItem
                icon="location-outline"
                label="Sobre o Campus"
                accent={accent}
                onPress={() => navigation.navigate('SobreCampus', { campusId: campus.id })}
              />
              <AcessoRapidoItem
                icon="information-circle-outline"
                label="Sobre a United"
                accent={accent}
                onPress={() => navigation.navigate('SobreUnited')}
              />
            </ScrollView>
          </View>

          {eventosDoCampus.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eventos em {campus.nome}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hScrollContent}
              >
                {eventosDoCampus.slice(0, 3).map((evento, index) => (
                  <TouchableOpacity
                    key={evento.id}
                    style={styles.eventoCard}
                    onPress={() => setEventoSelecionado(evento)}
                  >
                    {evento.capa ? (
                      <Image
                        source={{ uri: evento.capa, headers: { 'ngrok-skip-browser-warning': 'true' } }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : (
                      <LinearGradient
                        colors={PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(5,6,10,0.15)', 'rgba(5,6,10,0.9)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.eventoCardContent}>
                      <Text style={[styles.eventoData, { color: accent.light }]}>
                        {formatarData(evento.data)}
                      </Text>
                      <Text style={styles.eventoTitulo} numberOfLines={2}>
                        {evento.titulo}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {eventosDoCampus.length > 0 && (
                  <TouchableOpacity
                    style={styles.verMaisItem}
                    onPress={() => navigation.navigate('Eventos')}
                  >
                    <View style={[styles.verMaisIcon, { backgroundColor: accent.glow(0.2) }]}>
                      <Ionicons name="arrow-forward" size={16} color={accent.light} />
                    </View>
                    <Text style={styles.verMaisText}>Ver mais</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}
          

          {/* Série do mês — card grande com capa */}
          {serieDestaque && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Série do mês</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Series')}>
                <View style={styles.serieCard}>
                  <LinearGradient
                    colors={['#3C3489', '#712B13']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(5,6,10,0.2)', 'rgba(5,6,10,0.95)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.serieContent}>
                    <Text style={styles.serieTitulo}>{serieDestaque.titulo}</Text>
                    <Text style={styles.serieEpisodios}>
                      {serieDestaque.episodios.length} episódios · {campus.nome}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

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

      <EventoDetalheModal
        visible={!!eventoSelecionado}
        evento={eventoSelecionado}
        onClose={() => setEventoSelecionado(null)}
      />
    </View>
  );
}

function GlassIconButton({ children, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <GlassSurface intensity={30} style={styles.iconButton}>
        {children}
      </GlassSurface>
    </TouchableOpacity>
  );
}

function AcessoRapidoItem({ icon, label, onPress, accent }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <GlassSurface intensity={25} style={styles.quickItem}>
        <Ionicons name={icon} size={20} color={accent.light} />
        <Text style={styles.quickItemLabel} numberOfLines={2}>
          {label}
        </Text>
      </GlassSurface>
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
  // 66 (altura da tab bar) + ~30 (margem dela até o fundo) + folga —
  // se a altura da tab bar mudar no RootNavigator, ajustar aqui também.
  scrollContent: { paddingBottom: 130 },
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
    paddingHorizontal: SCREEN_PADDING,
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
  },

  heroBorder: {
    marginHorizontal: SCREEN_PADDING,
    borderRadius: 24,
    padding: 1,
  },
  heroInner: {
    borderRadius: 23,
    padding: 20,
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

  section: { marginTop: 26 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: SCREEN_PADDING,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
    paddingHorizontal: SCREEN_PADDING,
  },

  hScrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 10,
  },

  // Acesso rápido — quadrados pequenos
  quickItem: {
    width: 74,
    height: 74,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  quickItemLabel: {
    fontSize: 9.5,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Eventos — quadrados maiores, foto/degradê de fundo + texto sobreposto
  eventoCard: {
    width: EVENTO_CARD_SIZE,
    height: EVENTO_CARD_SIZE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  eventoCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  eventoData: { fontSize: 11, fontFamily: FONTS.mono, marginBottom: 3 },
  eventoTitulo: {
    fontSize: 15,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
  },
  verMaisItem: {
    width: 74, // mesma largura do quickItem, só pra não ficar solto/desalinhado
    height: EVENTO_CARD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verMaisIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verMaisText: {
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },

  // Série do mês — card grande, capa em degradê + texto sobreposto
  serieCard: {
    marginHorizontal: SCREEN_PADDING,
    height: 170,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  serieContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  serieTitulo: {
    fontSize: 19,
    fontFamily: FONTS.displayBold,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  serieEpisodios: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
  },

  exploreSection: { marginTop: 26, marginBottom: 24, paddingLeft: SCREEN_PADDING },
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