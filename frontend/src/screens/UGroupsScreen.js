// src/screens/ugroups/UGroupsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from '../components/GlassSurface';
import { getCampusAccent } from '../theme/campusAccent';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TAB_BAR_RESERVA } from '../theme/colors';

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

function UGroupRow({ grupo, accent, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{grupo.nome}</Text>
        {grupo.observacao ? <Text style={styles.observacao}>{grupo.observacao}</Text> : null}
        <Text style={styles.lideres}>{grupo.lideres}</Text>
      </View>
      <View style={styles.horarioBox}>
        <Text style={[styles.dia, { color: accent.base }]}>{grupo.dia}</Text>
        <Text style={styles.horario}>{grupo.horario}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </Pressable>
  );
}

export default function UGroupsScreen() {
  const navigation = useNavigation();
  const { usuario } = useAuth();
  const accent = getCampusAccent(usuario?.campus);
  const uGroups = MOCK_UGROUPS;

  return (
    <View style={styles.container}>
      <View style={[styles.glowTop, { backgroundColor: accent.glow }]} />
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 + TAB_BAR_RESERVA }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>uGroups</Text>
        <Text style={styles.subtitle}>{usuario?.campus?.nome ?? 'Seu campus'}</Text>

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
  container: { flex: 1, backgroundColor: COLORS.background },
  glowTop: { position: 'absolute', top: -100, left: -60, width: 320, height: 320, borderRadius: 200, opacity: 0.35 },
  title: { fontFamily: 'Sora-Bold', fontSize: 28, color: COLORS.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: 'JetBrainsMono-Regular', fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },
  listCard: { paddingVertical: 4, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 10 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 12 },
  nome: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: COLORS.textPrimary },
  observacao: { fontFamily: 'JetBrainsMono-Regular', fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  lideres: { fontFamily: 'Inter-Regular', fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  horarioBox: { alignItems: 'flex-end', minWidth: 64 },
  dia: { fontFamily: 'JetBrainsMono-Bold', fontSize: 11 },
  horario: { fontFamily: 'JetBrainsMono-Regular', fontSize: 11, color: COLORS.textSecondary },
});