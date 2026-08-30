import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS, FONTS } from '../theme/colors';
import GlassSurface from '../components/GlassSurface';

const PILARES = [
  {
    titulo: 'Nossa Fé é Fundamentada',
    texto:
      'Baseada na Palavra e no Espírito de Deus. O ensino bíblico é primordial em nossos cultos, pois é a Palavra e o Espírito juntos que transformam a vida do crente.',
  },
  {
    titulo: 'Nossa Expectativa é Excelência',
    texto:
      'Excelência é a chave para tudo que fazemos, sempre buscando ir além do esperado, promovendo o padrão do Reino.',
  },
  {
    titulo: 'Nosso Centro é Cristo',
    texto:
      'Ele é o foco principal, agora e sempre. Nosso propósito como igreja está enraizado nesta verdade em todas as estações.',
  },
  {
    titulo: 'Nossa Generosidade é Genuína',
    texto:
      'Acreditamos nos dízimos e ofertas, seguindo o exemplo da igreja primitiva em Atos 2, onde todos contribuíam para que todos tivessem suas necessidades supridas.',
  },
  {
    titulo: 'Nosso Mandamento é Multiplicação',
    texto:
      'Deus se importa com o perdido, e nós também. Acreditamos que fomos chamados a liderar em todas as áreas do ministério, desenvolvendo pessoas para cumprir seu chamado.',
  },
];

export default function SobreUnitedScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.wordmark}>untd.</Text>
      <Text style={styles.title}>Sobre a United</Text>

      <GlassSurface style={styles.visaoCard}>
        <Text style={styles.sectionLabel}>Nossa Visão</Text>
        <Text style={styles.visaoTexto}>
          Existimos para Alcançar, Construir e Empoderar a igreja através de pregar a
          mensagem transformadora de Jesus Cristo. Somos fundamentados na Palavra
          infalível de Deus, cheios e batizados no poder do Espírito Santo, convictos
          do nosso chamado para buscar e salvar os perdidos.
        </Text>
      </GlassSurface>

      <Text style={styles.sectionLabel}>Nossos Pilares</Text>
      {PILARES.map((p, idx) => (
        <GlassSurface key={p.titulo} style={styles.pilarCard} intensity={20}>
          <Text style={styles.pilarNumero}>{`#${idx + 1}`}</Text>
          <Text style={styles.pilarTitulo}>{p.titulo}</Text>
          <Text style={styles.pilarTexto}>{p.texto}</Text>
        </GlassSurface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  wordmark: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 20,
  },
  visaoCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  visaoTexto: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textPrimary,
  },
  pilarCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  pilarNumero: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  pilarTitulo: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  pilarTexto: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
});