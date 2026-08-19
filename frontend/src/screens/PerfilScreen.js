import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const campus = usuario.campus;
  const accent = getCampusAccent(campus?.corTema || COLORS.textSecondary);

  return (
    <View style={styles.root}>
      {/* Mesmo esquema de fundo da Home: glow lilás fixo no topo (identidade
          United) + glow do campus do usuário na base — aqui pode usar o
          accent à vontade porque a tela inteira É sobre o campus do usuário. */}
      <LinearGradient
        colors={[COLORS.brandGlowTop, COLORS.background, accent.glow(0.16)]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <View style={[styles.avatarPlaceholder, { borderColor: accent.light }]}>
              {usuario.foto_perfil ? (
                <Image
                  source={{ uri: usuario.foto_perfil, headers: { 'ngrok-skip-browser-warning': 'true' } }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={40} color={COLORS.textSecondary} />
              )}
            </View>
            <Text style={styles.nome}>{usuario.nome_completo}</Text>
            <Text style={styles.campusNome}>{campus?.nome}</Text>
            <View style={[styles.roleBadge, { backgroundColor: accent.base }]}>
              <Text style={[styles.roleBadgeText, { color: accent.textOnAccent }]}>
                {usuario.role === 'voluntario' ? 'Voluntário' : 'Membro'}
              </Text>
            </View>
          </View>

          <GlassSurface style={styles.menuCard}>
            <MenuItem
              icon="bookmark-outline"
              label="Versículos favoritos"
              accent={accent}
              onPress={() => navigation.getParent()?.navigate('VersiculosFavoritos')}
            />
            <MenuItem
              icon="create-outline"
              label="Editar dados pessoais"
              accent={accent}
              last={usuario.role === 'voluntario'}
              onPress={() => navigation.getParent()?.navigate('EditarDadosPessoais')}
            />
          </GlassSurface>

          {usuario.role !== 'voluntario' && (
            <GlassSurface style={styles.voluntarioNote} scrimOpacity={0.55}>
              <Ionicons name="information-circle-outline" size={18} color={accent.light} />
              <Text style={styles.voluntarioNoteText}>
                Funcionalidades de voluntário (escala, check-in) aparecerão aqui
                assim que sua participação for aprovada no Treinamento de Voluntários.
              </Text>
            </GlassSurface>
          )}

          <GlassSurface style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="Sair" danger last onPress={logout} />
          </GlassSurface>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuItem({ icon, label, danger, last, accent, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? COLORS.danger : accent ? accent.light : COLORS.textPrimary}
      />
      <Text style={[styles.menuItemLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 130 },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.glassFill,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  nome: { fontSize: 18, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  campusNome: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { fontSize: 12, fontFamily: FONTS.bodySemiBold },

  menuCard: { marginHorizontal: 16, marginTop: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  menuItemLabel: { marginLeft: 12, fontSize: 15, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },

  voluntarioNote: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  voluntarioNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});