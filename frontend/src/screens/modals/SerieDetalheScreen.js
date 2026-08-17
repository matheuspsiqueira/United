import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import YoutubePlayer from 'react-native-youtube-iframe';

import { COLORS, FONTS } from '../../theme/colors';
import { getCampusAccent } from '../../theme/campusAccent';
import GlassSurface from '../../components/GlassSurface';
import { useAuth } from '../../contexts/AuthContext';
import { buscarSerie } from '../../services/seriesApi';

const { width, height } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16;
const CAPA_HEIGHT = height * 0.5;

// Antes era um <Modal> renderizado condicionalmente por um `visible` prop.
// Agora é uma TELA de verdade, empilhada pelo AuthenticatedNavigator com
// presentation:'modal' — mesma aparência (desliza de baixo pra cima), mas
// roda na mesma janela nativa do resto do app. É isso que resolve a barra
// branca: o <Modal> do RN abre janela própria, que o expo-navigation-bar
// não alcança; uma tela de stack não tem esse problema.
export default function SerieDetalheScreen({ route, navigation }) {
  const { serieId } = route.params;
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [serie, setSerie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [episodioAtivo, setEpisodioAtivo] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await buscarSerie(token, serieId);
      setSerie(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, serieId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Modo cinema: some com a nav bar do Android enquanto essa tela estiver
  // em foco (aberta e visível) — volta ao normal ao sair dela (fechar o
  // modal ou navegar por cima). useFocusEffect já cobre o ciclo completo
  // sozinho, sem precisar de um `visible` prop como antes.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      return () => {
        NavigationBar.setVisibilityAsync('visible');
      };
    }, [])
  );

  // Botão físico/gesto de voltar do Android: se tiver um episódio tocando,
  // volta só pra lista de episódios (não fecha o modal inteiro de cara) —
  // igual o botão de voltar visual já fazia.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (episodioAtivo) {
        setEpisodioAtivo(null);
        return true; // consome o evento
      }
      return false; // deixa o comportamento padrão (fecha o modal) rolar
    });
    return () => sub.remove();
  }, [episodioAtivo]);

  const abrirEpisodio = (ep) => {
    setEpisodioAtivo(ep);
    setPlaying(true);
  };

  const accent = serie ? getCampusAccent(serie.campus_cor_tema) : null;

  return (
    <View style={styles.container}>
      {accent && (
        <LinearGradient
          colors={[COLORS.brandGlowTop, accent.glow(0.1), COLORS.background]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
        />
      )}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TouchableOpacity
          onPress={episodioAtivo ? () => setEpisodioAtivo(null) : () => navigation.goBack()}
          style={styles.topBtn}
        >
          <Ionicons
            name={episodioAtivo ? 'chevron-back' : 'close'}
            size={26}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

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

        {!loading && !erro && serie && !episodioAtivo && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
            {serie.capa && <Image source={{ uri: serie.capa }} style={styles.capa} resizeMode="cover" />}
            <View style={styles.header}>
              <Text style={[styles.campusTag, { color: accent.light }]}>{serie.campus_nome}</Text>
              <Text style={styles.titulo}>{serie.titulo}</Text>

              {!!serie.descricao && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDescricaoExpandida((v) => !v)}
                  style={styles.descricaoWrapper}
                >
                  <Text
                    style={styles.descricao}
                    numberOfLines={descricaoExpandida ? undefined : 3}
                  >
                    {serie.descricao}
                  </Text>
                  <Text style={[styles.verMaisTexto, { color: accent.light }]}>
                    {descricaoExpandida ? 'ler menos' : '...ler mais'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.episodios}>
              {serie.episodios.map((ep) => (
                <TouchableOpacity key={ep.id} activeOpacity={0.85} onPress={() => abrirEpisodio(ep)}>
                  <GlassSurface style={styles.epCard} scrimOpacity={0.5}>
                    <Image source={{ uri: ep.thumbnail_url }} style={styles.epThumb} resizeMode="cover" />
                    <View style={styles.epInfo}>
                      <Text style={styles.epNumero}>EP. {String(ep.numero).padStart(2, '0')}</Text>
                      <Text style={styles.epTitulo} numberOfLines={2}>{ep.titulo}</Text>
                      {ep.duracao_minutos ? (
                        <Text style={styles.epDuracao}>{ep.duracao_minutos} min</Text>
                      ) : null}
                    </View>
                  </GlassSurface>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {episodioAtivo && (
          <View>
            <YoutubePlayer
              height={PLAYER_HEIGHT}
              play={playing}
              videoId={episodioAtivo.youtube_id}
              onChangeState={(state) => {
                if (state === 'ended') setPlaying(false);
              }}
            />
            <View style={[styles.epInfoPlayer, { paddingBottom: insets.bottom }]}>
              <Text style={styles.epNumero}>EP. {String(episodioAtivo.numero).padStart(2, '0')}</Text>
              <Text style={styles.titulo}>{episodioAtivo.titulo}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  topBtn: { alignSelf: 'flex-start', padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  erroTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'center' },
  retryTexto: { color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium },
  capa: { width: '100%', height: CAPA_HEIGHT },
  header: { padding: 16 },
  campusTag: { fontSize: 11, fontFamily: FONTS.mono, textTransform: 'uppercase' },
  titulo: { fontSize: 22, fontFamily: FONTS.displayBold, color: COLORS.textPrimary, marginTop: 4 },
  descricaoWrapper: { marginTop: 8 },
  descricao: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, lineHeight: 19 },
  verMaisTexto: { fontSize: 12, fontFamily: FONTS.bodySemiBold, marginTop: 4 },
  episodios: { paddingHorizontal: 16, gap: 10 },
  epCard: { flexDirection: 'row' },
  epThumb: { width: 110, height: 72 },
  epInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  epInfoPlayer: { paddingHorizontal: 20, paddingTop: 16 },
  epNumero: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textSecondary, textTransform: 'uppercase' },
  epTitulo: { fontSize: 13, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary, marginTop: 2 },
  epDuracao: { fontSize: 11, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 4 },
});