import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';

// Troque pelo asset real quando tiver a foto definida.
// Se preferir puxar de uma URL (Cloudinary etc), troca o <Image> pra
// source={{ uri: ... }} e remove o require.
const HERO_IMAGE = require('../assets/ugroups-hero.png');; // ex: require('../../assets/images/ugroups-hero.jpg');

const MOCK_UGROUPS = [
  { id: '1', nome: 'Merck', dia: 'Sexta', horario: '20h', lideres: 'Carlos e Ethayssa' },
  { id: '2', nome: 'Mananciais', dia: 'Terça', horario: '20h', lideres: 'Alexandre e Raphaela' },
  { id: '3', nome: 'Taquara', dia: 'Quarta', horario: '20h', lideres: 'David e Nayara' },
  { id: '4', nome: 'Mulheres', dia: 'Sexta', horario: '20h', lideres: 'Giovanna' },
  { id: '5', nome: 'Youth', dia: 'Sexta', horario: '20h', lideres: 'Will e Ethainá' },
  { id: '6', nome: 'Pechincha 1', dia: 'Quarta', horario: '20h', lideres: 'Walter e Camila' },
  { id: '7', nome: 'Pechincha 2', dia: 'Terça', horario: '20h', lideres: 'Gustavo e Bruna' },
  { id: '8', nome: 'Tanque', dia: 'Terça', horario: '20h', lideres: 'Gabriel e Gabriella' },
  { id: '9', nome: 'Freguesia', dia: 'Terça', horario: '20h', lideres: 'José e Juliana' },
  { id: '10', nome: 'Caixa D\u2019Água', dia: 'Sexta', horario: '20h', lideres: 'Prs. Jackson e Danúbia', observacao: 'Quinzenal' },
  { id: '11', nome: 'Juniores', dia: 'Sexta', horario: '20h', lideres: 'Will e Ethainá' },
  { id: '12', nome: 'Online', dia: 'Sábado', horario: '10h', lideres: 'Matheus e Samara' },
];

function UGroupsHero({ accent }) {
  return (
    <View style={styles.hero}>
      {HERO_IMAGE ? (
        <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={['#3C3489', '#712B13']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(5,6,10,0.25)', 'rgba(5,6,10,0.92)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroContent}>
        <Text style={[styles.heroEyebrow, { color: accent.light }]}>CULTOS NOS LARES</Text>
        <Text style={styles.heroTitulo}>uGroups são nossos cultos nos lares</Text>
      </View>
    </View>
  );
}

function UGroupRow({ grupo, accent, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{grupo.nome}</Text>
        {grupo.observacao ? <Text style={styles.observacao}>{grupo.observacao}</Text> : null}
        <Text style={styles.lideres}>{grupo.lideres}</Text>
      </View>
      <View style={styles.horarioBox}>
        <Text style={[styles.dia, { color: accent.light }]}>{grupo.dia}</Text>
        <Text style={styles.horario}>{grupo.horario}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default function UGroupsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const accent = usuario?.campus?.corTema
    ? getCampusAccent(usuario.campus.corTema)
    : getCampusAccent(null);
  const uGroups = MOCK_UGROUPS;

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
        <UGroupsHero accent={accent} />

        <GlassSurface style={styles.listCard}>
          {uGroups.map((grupo, index) => (
            <React.Fragment key={grupo.id}>
              <UGroupRow
                grupo={grupo}
                accent={accent}
                onPress={() =>
                  navigation.getParent()?.getParent()?.navigate('UGroupDetalhe', { uGroupId: grupo.id })
                }
              />
              {index < uGroups.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </GlassSurface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },

  hero: {
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  heroEyebrow: { fontSize: 11, fontFamily: FONTS.mono, letterSpacing: 1, marginBottom: 6 },
  heroTitulo: {
    fontSize: 20,
    fontFamily: FONTS.displayBold,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },

  listCard: { paddingVertical: 4, paddingHorizontal: 4, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 10 },
  divider: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 12 },
  nome: { fontSize: 15, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  observacao: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textSecondary, marginTop: 1 },
  lideres: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  horarioBox: { alignItems: 'flex-end', minWidth: 64 },
  dia: { fontSize: 11, fontFamily: FONTS.mono },
  horario: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textSecondary },
});