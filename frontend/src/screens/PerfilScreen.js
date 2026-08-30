import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const ROLE_LABELS = {
  membro: 'Membro',
  voluntario: 'Voluntário',
  lider: 'Líder',
  pastor_presidente: 'Pastor Presidente',
  apostolo: 'Apóstolo',
};

const ROLES_COM_DASHBOARD = ['lider', 'pastor_presidente', 'apostolo'];

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const campus = usuario.campus;
  const accent = getCampusAccent(campus?.corTema || COLORS.textSecondary);

  const roleLabel = ROLE_LABELS[usuario.role] || ROLE_LABELS.membro;
  const isVoluntarioOuSuperior = usuario.role !== 'membro';
  const podeAcessarDashboard =
    ROLES_COM_DASHBOARD.includes(usuario.role) ||
    (usuario.role === 'voluntario' && usuario.acesso_dashboard);

  return (
    <View style={styles.root}>
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
                {roleLabel}
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
              last={!isVoluntarioOuSuperior}
              onPress={() => navigation.getParent()?.navigate('EditarDadosPessoais')}
            />
          </GlassSurface>

          {isVoluntarioOuSuperior && (
            <GlassSurface style={styles.menuCard}>
              {podeAcessarDashboard && (
                <MenuItem
                  icon="grid-outline"
                  label="Acessar dashboard"
                  accent={accent}
                  onPress={() => Linking.openURL(`${API_BASE_URL.replace(/\/api\/?$/, '')}/dashboard/`)}
                />
              )}
              <MenuItem
                icon="qr-code-outline"
                label="Check-in"
                accent={accent}
                disabled
                badge="Em breve"
              />
              <MenuItem
                icon="calendar-outline"
                label="Escala"
                accent={accent}
                disabled
                last
                badge="Em breve"
              />
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

function MenuItem({ icon, label, danger, last, accent, onPress, disabled, badge }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder, disabled && styles.menuItemDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? COLORS.danger : disabled ? COLORS.textSecondary : accent ? accent.light : COLORS.textPrimary}
      />
      <Text
        style={[
          styles.menuItemLabel,
          danger && { color: COLORS.danger },
          disabled && { color: COLORS.textSecondary },
        ]}
      >
        {label}
      </Text>
      {badge && (
        <View style={styles.menuItemBadge}>
          <Text style={styles.menuItemBadgeText}>{badge}</Text>
        </View>
      )}
      {!danger && !badge && (
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
  menuItemDisabled: { opacity: 0.55 },
  menuItemLabel: { marginLeft: 12, fontSize: 15, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },
  menuItemBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.glassFill,
  },
  menuItemBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
  },
});