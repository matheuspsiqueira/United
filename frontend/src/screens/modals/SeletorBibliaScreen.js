import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../../theme/colors';
import { getCampusAccent } from '../../theme/campusAccent';
import GlassSurface from '../../components/GlassSurface';
import { nomeLocalizado, slugLivro } from '../../utils/bibliaHelpers';

// Stack.Screen (presentation: 'modal') — substitui o <Modal> antigo pra
// evitar o bug de nav bar do Android (mesma causa dos outros 5 modais
// migrados: <Modal> roda numa window separada, essa tela roda na mesma
// Activity). Recebe a lista de livros e devolve a escolha via
// route.params.onSelecionar, depois faz goBack().
export default function SeletorBibliaScreen({ route, navigation }) {
  const { livros = [], livroAtivoSlug, capituloAtivo, accentHex, onSelecionar } = route.params;
  const accent = useMemo(() => getCampusAccent(accentHex || '#9B8AD9'), [accentHex]);

  const [step, setStep] = useState('livros'); // 'livros' | 'capitulos'
  const [testamentoAtivo, setTestamentoAtivo] = useState('AT');
  const [livroSelecionado, setLivroSelecionado] = useState(
    livros.find((l) => slugLivro(l) === livroAtivoSlug) || null
  );

  const livrosPorTestamento = useMemo(() => {
    const at = livros.slice(0, 39);
    const nt = livros.slice(39);
    return { AT: at, NT: nt };
  }, [livros]);

  const totalCapitulos = livroSelecionado?.chapters || livroSelecionado?.totalChapters || 1;
  const nomeLivroSelecionado = nomeLocalizado(livroSelecionado?.name) || nomeLocalizado(livroSelecionado?.title);

  const escolherLivro = (livro) => {
    setLivroSelecionado(livro);
    setStep('capitulos');
  };

  const escolherCapitulo = (numero) => {
    onSelecionar?.(livroSelecionado, numero);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {step === 'capitulos' ? (
          <Pressable style={styles.headerVoltar} onPress={() => setStep('livros')}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.headerVoltarTexto}>{nomeLivroSelecionado}</Text>
          </Pressable>
        ) : (
          <Text style={styles.headerTitulo}>Selecionar livro</Text>
        )}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {step === 'livros' ? (
        <>
          <View style={styles.testamentoToggle}>
            {['AT', 'NT'].map((t) => (
              <Pressable
                key={t}
                onPress={() => setTestamentoAtivo(t)}
                style={[
                  styles.testamentoChip,
                  testamentoAtivo === t && { borderColor: accent.base },
                ]}
              >
                <Text
                  style={[
                    styles.testamentoChipTexto,
                    testamentoAtivo === t && { color: accent.light },
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
              const ativo = slugAtual === livroAtivoSlug;
              return (
                <Pressable
                  key={`livro-${testamentoAtivo}-${idx}-${slugAtual}`}
                  style={[styles.livroChip, ativo && { borderColor: accent.base, borderWidth: 1 }]}
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
          {Array.from({ length: totalCapitulos }, (_, i) => i + 1).map((numero) => {
            const ativo = numero === capituloAtivo && slugLivro(livroSelecionado) === livroAtivoSlug;
            return (
              <Pressable
                key={numero}
                style={[styles.capituloCelula, ativo && { borderColor: accent.base }]}
                onPress={() => escolherCapitulo(numero)}
              >
                <Text style={[styles.capituloCelulaTexto, ativo && { color: accent.light }]}>
                  {numero}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  headerTitulo: { fontFamily: FONTS.displaySemiBold, fontSize: 17, color: COLORS.textPrimary },
  headerVoltar: { flexDirection: 'row', alignItems: 'center' },
  headerVoltarTexto: { fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, fontSize: 15, marginLeft: 2 },

  testamentoToggle: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  testamentoChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testamentoChipTexto: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.textSecondary },

  livrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 32 },
  livroChip: {
    backgroundColor: COLORS.glassFill,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  livroChipTexto: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textPrimary },

  capitulosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 32 },
  capituloCelula: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.glassFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capituloCelulaTexto: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textPrimary },
});