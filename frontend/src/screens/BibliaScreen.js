import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, FONTS, HIGHLIGHT_COLORS } from '../theme/colors';
import { getLivros, getCapitulo } from '../services/bibliaApi';

// A API devolve nome/título/slug como objeto multilíngue: { en, 'pt-br', es, ... }.
// Extrai o português, com fallback pro inglês e por último pra string crua
// (caso algum endpoint antigo ainda devolva string simples).
function nomeLocalizado(campo) {
  if (!campo) return '';
  if (typeof campo === 'string') return campo;
  return campo['pt-br'] || campo.pt || campo.en || Object.values(campo)[0] || '';
}

// Slug do livro pra usar em chamadas de API e como chave estável.
// slug/abbrev também podem vir como objeto multilíngue — mesma extração.
function slugLivro(livro) {
  if (!livro) return '';
  return nomeLocalizado(livro.slug) || nomeLocalizado(livro.abbrev) || livro.id || '';
}

// Versões disponíveis pro toggle do header. A Midvash tem 86 versões, mas
// pro MVP só expomos as duas que interessam pra igreja.
const VERSOES = [
  { slug: 'nvi', label: 'NVI' },
  { slug: 'ntlh', label: 'NTLH' },
];

const HIGHLIGHT_LIST = Object.values(HIGHLIGHT_COLORS);

// Grifar = favoritar (ação única). O versículo marcado com uma cor É o
// favorito — não existem dois estados separados. Persistido localmente
// via AsyncStorage por enquanto (ver TODO BACKEND em bibliaApi.js);
// quando o Django existir, isso migra pra usuario.versiculos_favoritos
// mantendo o mesmo shape { [verseId]: corHex }.
const GRIFOS_STORAGE_KEY = '@united:biblia:grifos';

export default function BibliaScreen({ route }) {
  const corTema = route?.params?.corTema || COLORS.textPrimary;

  const [versao, setVersao] = useState('nvi');
  const [livros, setLivros] = useState([]);
  const [livrosCarregando, setLivrosCarregando] = useState(true);
  const [livrosErro, setLivrosErro] = useState(null);

  const [livroAtivo, setLivroAtivo] = useState(null); // objeto do livro selecionado
  const [capituloAtivo, setCapituloAtivo] = useState(1);
  const [capituloData, setCapituloData] = useState(null);
  const [capituloCarregando, setCapituloCarregando] = useState(false);
  const [capituloErro, setCapituloErro] = useState(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerStep, setPickerStep] = useState('livros'); // 'livros' | 'capitulos'
  const [testamentoAtivo, setTestamentoAtivo] = useState('AT');

  const [versiculoSelecionadoId, setVersiculoSelecionadoId] = useState(null);
  const [grifos, setGrifos] = useState({}); // { [verseId]: corHex } — grifo = favorito
  const [grifosCarregados, setGrifosCarregados] = useState(false);

  // ---- Carrega os grifos salvos (AsyncStorage) na montagem ----
  useEffect(() => {
    let cancelado = false;
    AsyncStorage.getItem(GRIFOS_STORAGE_KEY)
      .then((json) => {
        if (cancelado) return;
        if (json) setGrifos(JSON.parse(json));
      })
      .catch(() => {
        // leitura falhou — segue com grifos vazios, não é crítico
      })
      .finally(() => {
        if (!cancelado) setGrifosCarregados(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // ---- Salva os grifos sempre que mudam (só depois do load inicial, pra
  // não sobrescrever o storage com {} antes de ler o que já existia) ----
  useEffect(() => {
    if (!grifosCarregados) return;
    AsyncStorage.setItem(GRIFOS_STORAGE_KEY, JSON.stringify(grifos)).catch(() => {});
  }, [grifos, grifosCarregados]);

  // ---- Carrega a lista dos 66 livros na montagem ----
  useEffect(() => {
    let cancelado = false;
    setLivrosCarregando(true);
    setLivrosErro(null);

    getLivros()
      .then((data) => {
        if (cancelado) return;
        const lista = Array.isArray(data) ? data : data?.books || [];
        setLivros(lista);
        // Testamento: a API pode ou não devolver esse campo (não confirmei
        // o payload real ainda). Fallback: primeiros 39 = AT, resto = NT,
        // que é a ordem canônica protestante.
        const primeiro = lista[0];
        if (primeiro) {
          setLivroAtivo(primeiro);
        }
      })
      .catch((err) => {
        if (!cancelado) setLivrosErro(err.message || 'Não foi possível carregar os livros.');
      })
      .finally(() => {
        if (!cancelado) setLivrosCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // ---- Carrega o capítulo sempre que livro, capítulo ou versão mudam ----
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

    return () => {
      cancelado = true;
    };
  }, [livroAtivo, capituloAtivo, versao]);

  const livrosPorTestamento = useMemo(() => {
    const at = livros.slice(0, 39);
    const nt = livros.slice(39);
    return { AT: at, NT: nt };
  }, [livros]);

  const abrirPicker = () => {
    setPickerStep('livros');
    setPickerVisible(true);
  };

  const escolherLivro = (livro) => {
    setLivroAtivo(livro);
    setCapituloAtivo(1);
    setPickerStep('capitulos');
  };

  const escolherCapitulo = (numero) => {
    setCapituloAtivo(numero);
    setPickerVisible(false);
  };

  const totalCapitulos = livroAtivo?.chapters || livroAtivo?.totalChapters || 1;

  const toggleVersiculoAtivo = (id) => {
    setVersiculoSelecionadoId((atual) => (atual === id ? null : id));
  };

  const aplicarGrifo = (cor) => {
    if (!versiculoSelecionadoId) return;
    setGrifos((atual) => ({ ...atual, [versiculoSelecionadoId]: cor }));
  };

  const removerGrifo = () => {
    if (!versiculoSelecionadoId) return;
    setGrifos((atual) => {
      const copia = { ...atual };
      delete copia[versiculoSelecionadoId];
      return copia;
    });
    setVersiculoSelecionadoId(null);
  };

  // Normaliza a lista de versículos do capítulo. O payload exato do
  // endpoint de capítulo não foi confirmado ainda — cobre os formatos
  // mais prováveis (array de strings ou array de objetos {number, text}).
  const versiculosNormalizados = useMemo(() => {
    const verses = capituloData?.verses || [];
    return verses.map((v, index) => {
      if (typeof v === 'string') {
        return { numero: index + 1, texto: v };
      }
      return { numero: v.number ?? index + 1, texto: v.text ?? String(v) };
    });
  }, [capituloData]);

  const nomeLivroExibido = nomeLocalizado(livroAtivo?.name) || nomeLocalizado(livroAtivo?.title);
  const slugLivroAtivo = slugLivro(livroAtivo);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.livroCapituloBtn} onPress={abrirPicker}>
          <Text style={[styles.livroNome, { color: corTema }]} numberOfLines={1}>
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
                versao === v.slug && { backgroundColor: corTema },
              ]}
            >
              <Text
                style={[
                  styles.versaoChipText,
                  versao === v.slug && styles.versaoChipTextAtiva,
                ]}
              >
                {v.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Corpo — leitura */}
      {livrosErro ? (
        <ErroBloco mensagem={livrosErro} />
      ) : capituloCarregando || livrosCarregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={corTema} />
        </View>
      ) : capituloErro ? (
        <ErroBloco mensagem={capituloErro} />
      ) : (
        <ScrollView
          style={styles.leitura}
          contentContainerStyle={styles.leituraConteudo}
          onScrollBeginDrag={() => setVersiculoSelecionadoId(null)}
        >
          {versiculosNormalizados.map((v) => {
            const id = `${versao}-${slugLivroAtivo}-${capituloAtivo}-${v.numero}`;
            const grifo = grifos[id];
            const selecionado = versiculoSelecionadoId === id;

            return (
              <Pressable
                key={id}
                onPress={() => toggleVersiculoAtivo(id)}
                style={[
                  styles.versiculoLinha,
                  selecionado && styles.versiculoSelecionado,
                ]}
              >
                <Text style={styles.versiculoNumero}>{String(v.numero).padStart(2, '0')}</Text>
                <Text
                  style={[
                    styles.versiculoTexto,
                    grifo && { backgroundColor: grifo + 'CC', color: COLORS.background }, // grifo tipo marca-texto
                  ]}
                >
                  {v.texto}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Menu flutuante — grifar = favoritar, aparece com versículo selecionado */}
      {versiculoSelecionadoId && (
        <View style={styles.menuFlutuante}>
          {HIGHLIGHT_LIST.map((cor) => (
            <Pressable
              key={cor}
              style={[
                styles.corBolha,
                { backgroundColor: cor },
                grifos[versiculoSelecionadoId] === cor && styles.corBolhaAtiva,
              ]}
              onPress={() => aplicarGrifo(cor)}
            />
          ))}
          <View style={styles.menuDivisor} />
          <Pressable onPress={removerGrifo} style={styles.menuIconeBtn}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.textSecondary} />
          </Pressable>
        </View>
      )}

      {/* Bottom sheet — seleção de livro/capítulo */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.modalFundo} onPress={() => setPickerVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {pickerStep === 'capitulos' && (
            <Pressable
              style={styles.sheetVoltar}
              onPress={() => setPickerStep('livros')}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
              <Text style={styles.sheetVoltarTexto}>{nomeLivroExibido}</Text>
            </Pressable>
          )}

          {pickerStep === 'livros' ? (
            <>
              <View style={styles.testamentoToggle}>
                {['AT', 'NT'].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTestamentoAtivo(t)}
                    style={[
                      styles.testamentoChip,
                      testamentoAtivo === t && { borderColor: corTema },
                    ]}
                  >
                    <Text
                      style={[
                        styles.testamentoChipTexto,
                        testamentoAtivo === t && { color: corTema },
                      ]}
                    >
                      {t === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <ScrollView contentContainerStyle={styles.livrosGrid}>
                {livrosPorTestamento[testamentoAtivo].map((livro, idx) => {
                  const slugAtual = slugLivro(livro);
                  return (
                    <Pressable
                      key={`livro-${testamentoAtivo}-${idx}-${slugAtual}`}
                      style={styles.livroChip}
                      onPress={() => escolherLivro(livro)}
                    >
                      <Text style={styles.livroChipTexto}>
                        {nomeLocalizado(livro.name) || nomeLocalizado(livro.title)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            <ScrollView contentContainerStyle={styles.capitulosGrid}>
              {Array.from({ length: totalCapitulos }, (_, i) => i + 1).map((numero) => (
                <Pressable
                  key={numero}
                  style={[
                    styles.capituloCelula,
                    numero === capituloAtivo && { borderColor: corTema },
                  ]}
                  onPress={() => escolherCapitulo(numero)}
                >
                  <Text
                    style={[
                      styles.capituloCelulaTexto,
                      numero === capituloAtivo && { color: corTema },
                    ]}
                  >
                    {numero}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
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
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 10 },
  erroTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center', fontSize: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  livroCapituloBtn: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 },
  livroNome: { fontFamily: FONTS.displaySemiBold, fontSize: 18, marginRight: 8 },
  capituloRef: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  versaoToggle: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 8, padding: 2 },
  versaoChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  versaoChipText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5 },
  versaoChipTextAtiva: { color: COLORS.background, fontFamily: FONTS.bodySemiBold },

  leitura: { flex: 1 },
  leituraConteudo: { padding: 20, paddingBottom: 100 },
  versiculoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  versiculoSelecionado: { backgroundColor: COLORS.surfaceElevated },
  versiculoNumero: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textSecondary,
    width: 22,
    marginTop: 4,
  },
  versiculoTexto: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 17,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },

  menuFlutuante: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
  corBolha: { width: 22, height: 22, borderRadius: 11 },
  corBolhaAtiva: {
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  menuDivisor: { width: 1, height: 20, backgroundColor: COLORS.border },
  menuIconeBtn: { padding: 2 },

  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sheetVoltarTexto: { fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, fontSize: 14, marginLeft: 2 },

  testamentoToggle: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  testamentoChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  testamentoChipTexto: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.textSecondary },

  livrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12 },
  livroChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  livroChipTexto: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textPrimary },

  capitulosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12 },
  capituloCelula: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capituloCelulaTexto: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textPrimary },
});