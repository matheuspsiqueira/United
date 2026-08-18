import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, HIGHLIGHT_COLORS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { getLivros, getCapitulo } from '../services/bibliaApi';
import { getGrifos, salvarGrifo, removerGrifoApi } from '../services/versiculosApi';
import { useAuth } from '../contexts/AuthContext';
import { nomeLocalizado, slugLivro } from '../utils/bibliaHelpers';

const VERSOES = [
  { slug: 'nvi', label: 'NVI' },
  { slug: 'ntlh', label: 'NTLH' },
];

const HIGHLIGHT_LIST = Object.values(HIGHLIGHT_COLORS);

// Dimensões estimadas do menu flutuante, usadas só pro clamp de posição
// (não precisam ser exatas, só próximas o bastante pra não estourar a tela)
const MENU_WIDTH = 232;
const MENU_HEIGHT = 52;
const TAB_BAR_RESERVA = 130; // mesma reserva usada no paddingBottom do scroll

export default function BibliaScreen({ navigation }) {
  const { token, usuario } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const accent = useMemo(
    () => getCampusAccent(usuario?.campus?.corTema || '#9B8AD9'),
    [usuario?.campus?.corTema]
  );

  const [versao, setVersao] = useState('nvi');
  const [livros, setLivros] = useState([]);
  const [livrosCarregando, setLivrosCarregando] = useState(true);
  const [livrosErro, setLivrosErro] = useState(null);

  const [livroAtivo, setLivroAtivo] = useState(null);
  const [capituloAtivo, setCapituloAtivo] = useState(1);
  const [capituloData, setCapituloData] = useState(null);
  const [capituloCarregando, setCapituloCarregando] = useState(false);
  const [capituloErro, setCapituloErro] = useState(null);

  const [versiculoSelecionadoId, setVersiculoSelecionadoId] = useState(null);
  // Posição do menu flutuante, calculada a partir do toque no versículo.
  // null enquanto nenhum versículo tá selecionado.
  const [menuPos, setMenuPos] = useState(null);
  const [grifos, setGrifos] = useState({});

  useEffect(() => {
    if (!token) {
      setGrifos({});
      return;
    }
    let cancelado = false;
    getGrifos(token)
      .then((lista) => {
        if (cancelado) return;
        const mapa = {};
        (lista || []).forEach((item) => {
          mapa[item.verse_id] = item.cor;
        });
        setGrifos(mapa);
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, [token]);

  useEffect(() => {
    let cancelado = false;
    setLivrosCarregando(true);
    setLivrosErro(null);

    getLivros()
      .then((data) => {
        if (cancelado) return;
        const lista = Array.isArray(data) ? data : data?.books || [];
        setLivros(lista);
        const primeiro = lista[0];
        if (primeiro) setLivroAtivo(primeiro);
      })
      .catch((err) => {
        if (!cancelado) setLivrosErro(err.message || 'Não foi possível carregar os livros.');
      })
      .finally(() => {
        if (!cancelado) setLivrosCarregando(false);
      });

    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (!livroAtivo) return;
    const slug = slugLivro(livroAtivo);
    if (!slug) return;

    let cancelado = false;
    setCapituloCarregando(true);
    setCapituloErro(null);

    getCapitulo(versao, slug, capituloAtivo)
      .then((data) => {
        if (!cancelado) setCapituloData(data);
      })
      .catch((err) => {
        if (!cancelado) setCapituloErro(err.message || 'Não foi possível carregar o capítulo.');
      })
      .finally(() => {
        if (!cancelado) setCapituloCarregando(false);
      });

    return () => { cancelado = true; };
  }, [livroAtivo, capituloAtivo, versao]);

  const totalCapitulos = livroAtivo?.chapters || livroAtivo?.totalChapters || 1;

  // Calcula onde o menu deve aparecer a partir do ponto do toque (pageX/pageY,
  // relativos à tela inteira — por isso o menu fica FORA da SafeAreaView).
  // Tenta abrir ACIMA do dedo (padrão de "seleção de texto"); se não couber
  // (verso muito no topo da tela), abre ABAIXO. Sempre clampado nas laterais
  // e sem invadir a área reservada da tab bar flutuante.
  const calcularMenuPos = (pageX, pageY) => {
    const left = Math.min(
      Math.max(pageX - MENU_WIDTH / 2, 12),
      screenWidth - MENU_WIDTH - 12
    );

    const acimaDoToque = pageY - MENU_HEIGHT - 16;
    const cabeAcima = acimaDoToque > insets.top + 8;
    const top = cabeAcima
      ? acimaDoToque
      : Math.min(pageY + 24, screenHeight - MENU_HEIGHT - TAB_BAR_RESERVA);

    return { top, left };
  };

  const toggleVersiculoAtivo = (id, event) => {
    setVersiculoSelecionadoId((atual) => {
      if (atual === id) {
        setMenuPos(null);
        return null;
      }
      const { pageX, pageY } = event.nativeEvent;
      setMenuPos(calcularMenuPos(pageX, pageY));
      return id;
    });
  };

  const aplicarGrifo = (cor) => {
    if (!versiculoSelecionadoId) return;
    const id = versiculoSelecionadoId;
    const corAnterior = grifos[id];

    setGrifos((atual) => ({ ...atual, [id]: cor }));

    if (token) {
      salvarGrifo(token, id, cor).catch(() => {
        setGrifos((atual) => ({ ...atual, [id]: corAnterior }));
      });
    }
  };

  const removerGrifo = () => {
    if (!versiculoSelecionadoId) return;
    const id = versiculoSelecionadoId;
    const corAnterior = grifos[id];

    setGrifos((atual) => {
      const copia = { ...atual };
      delete copia[id];
      return copia;
    });
    setVersiculoSelecionadoId(null);
    setMenuPos(null);

    if (token && corAnterior) {
      removerGrifoApi(token, id).catch(() => {
        setGrifos((atual) => ({ ...atual, [id]: corAnterior }));
      });
    }
  };

  const versiculosNormalizados = useMemo(() => {
    const verses = capituloData?.verses || [];
    return verses.map((v, index) => {
      if (typeof v === 'string') return { numero: index + 1, texto: v };
      return { numero: v.number ?? index + 1, texto: v.text ?? String(v) };
    });
  }, [capituloData]);

  const nomeLivroExibido = nomeLocalizado(livroAtivo?.name) || nomeLocalizado(livroAtivo?.title);
  const slugLivroAtivo = slugLivro(livroAtivo);

  const abrirPicker = () => {
    navigation.getParent().navigate('SeletorBiblia', {
      livros,
      livroAtivoSlug: slugLivroAtivo,
      capituloAtivo,
      accentHex: accent.base,
      onSelecionar: (livro, capitulo) => {
        setLivroAtivo(livro);
        setCapituloAtivo(capitulo);
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, COLORS.background, accent.glow(0.14)]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerWrapper}>
          <GlassSurface style={styles.headerGlass}>
            <Pressable style={styles.livroCapituloBtn} onPress={abrirPicker}>
              <Text style={[styles.livroNome, { color: accent.light }]} numberOfLines={1}>
                {nomeLivroExibido || 'Bíblia'}
              </Text>
              <Text style={styles.capituloRef}>
                CAP. {capituloAtivo}{totalCapitulos ? ` / ${totalCapitulos}` : ''}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />
            </Pressable>

            <View style={styles.versaoToggle}>
              {VERSOES.map((v) => (
                <Pressable
                  key={v.slug}
                  onPress={() => setVersao(v.slug)}
                  style={[
                    styles.versaoChip,
                    versao === v.slug && { backgroundColor: accent.base },
                  ]}
                >
                  <Text
                    style={[
                      styles.versaoChipText,
                      versao === v.slug && { color: accent.textOnAccent, fontFamily: FONTS.bodySemiBold },
                    ]}
                  >
                    {v.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </GlassSurface>
        </View>

        {livrosErro ? (
          <ErroBloco mensagem={livrosErro} />
        ) : capituloCarregando || livrosCarregando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={accent.base} />
          </View>
        ) : capituloErro ? (
          <ErroBloco mensagem={capituloErro} />
        ) : (
          <ScrollView
            style={styles.leitura}
            contentContainerStyle={styles.leituraConteudo}
            onScrollBeginDrag={() => {
              setVersiculoSelecionadoId(null);
              setMenuPos(null);
            }}
          >
            {versiculosNormalizados.map((v) => {
              const id = `${versao}|${slugLivroAtivo}|${capituloAtivo}|${v.numero}`;
              const grifo = grifos[id];
              const selecionado = versiculoSelecionadoId === id;

              return (
                <Pressable
                  key={id}
                  onPress={(event) => toggleVersiculoAtivo(id, event)}
                  style={[
                    styles.versiculoLinha,
                    selecionado && { backgroundColor: COLORS.glassFillElevated },
                  ]}
                >
                  <Text style={styles.versiculoNumero}>{String(v.numero).padStart(2, '0')}</Text>
                  <Text
                    style={[
                      styles.versiculoTexto,
                      grifo && { backgroundColor: grifo + 'CC', color: COLORS.background },
                    ]}
                  >
                    {v.texto}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Fica FORA da SafeAreaView de propósito — pageX/pageY do toque são
          relativos à tela inteira, então a origem de posicionamento aqui
          precisa ser a mesma (a SafeAreaView desloca sua própria origem
          pelo inset do topo e faria a conta bater errado). */}
      {versiculoSelecionadoId && menuPos && (
        <GlassSurface
          style={[
            styles.menuFlutuante,
            { top: menuPos.top, left: menuPos.left, width: MENU_WIDTH },
          ]}
        >
          <View style={styles.menuFlutuanteConteudo}>
            {HIGHLIGHT_LIST.map((cor) => (
              <Pressable
                key={cor}
                style={[
                  styles.corBolha,
                  { backgroundColor: cor },
                  grifos[versiculoSelecionadoId] === cor && { borderColor: accent.light, borderWidth: 2 },
                ]}
                onPress={() => aplicarGrifo(cor)}
              />
            ))}
            <View style={styles.menuDivisor} />
            <Pressable onPress={removerGrifo} style={styles.menuIconeBtn}>
              <Ionicons name="close-circle-outline" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </GlassSurface>
      )}
    </View>
  );
}

function ErroBloco({ mensagem }) {
  return (
    <View style={styles.centro}>
      <Ionicons name="cloud-offline-outline" size={40} color={COLORS.textSecondary} />
      <Text style={styles.erroTexto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 10 },
  erroTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center', fontSize: 14 },

  headerWrapper: { paddingHorizontal: 16, paddingTop: 8 },
  headerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  livroCapituloBtn: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 },
  livroNome: { fontFamily: FONTS.displaySemiBold, fontSize: 18, marginRight: 8 },
  capituloRef: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5 },
  versaoToggle: { flexDirection: 'row', backgroundColor: COLORS.glassFill, borderRadius: 8, padding: 2 },
  versaoChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  versaoChipText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5 },

  leitura: { flex: 1 },
  leituraConteudo: { padding: 20, paddingBottom: 130 },
  versiculoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  versiculoNumero: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textSecondary, width: 22, marginTop: 4 },
  versiculoTexto: { flex: 1, fontFamily: FONTS.bodyRegular, fontSize: 17, lineHeight: 28, color: COLORS.textPrimary },

  menuFlutuante: {
    position: 'absolute',
    borderRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
  menuFlutuanteConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  corBolha: { width: 22, height: 22, borderRadius: 11 },
  menuDivisor: { width: 1, height: 20, backgroundColor: COLORS.border },
  menuIconeBtn: { padding: 2 },
});