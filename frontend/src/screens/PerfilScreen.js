import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';
import { USUARIO_MOCK, getCampusById } from '../data/mockData';

export default function PerfilScreen() {
  const campus = getCampusById(USUARIO_MOCK.campusId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.nome}>{USUARIO_MOCK.nome}</Text>
        <Text style={styles.campusNome}>{campus.nome}</Text>
        <View style={[styles.roleBadge, { backgroundColor: campus.corTema }]}>
          <Text style={styles.roleBadgeText}>
            {USUARIO_MOCK.role === 'voluntario' ? 'Voluntário' : 'Membro'}
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon="bookmark-outline"
          label={`Versículos favoritos (${USUARIO_MOCK.versiculosFavoritos.length})`}
        />
        <MenuItem icon="swap-horizontal-outline" label="Alterar campus" />
        <MenuItem icon="create-outline" label="Editar dados pessoais" />

        {USUARIO_MOCK.role !== 'voluntario' && (
          <View style={styles.voluntarioNote}>
            <Text style={styles.voluntarioNoteText}>
              Funcionalidades de voluntário (escala, check-in) aparecerão aqui
              assim que sua participação for aprovada na Feira de Voluntários.
            </Text>
          </View>
        )}

        <MenuItem icon="log-out-outline" label="Sair" danger />
      </View>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.textPrimary} />
      <Text style={[styles.menuItemLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nome: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  campusNome: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  menu: { paddingHorizontal: 16, marginTop: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLabel: { marginLeft: 12, fontSize: 15, color: COLORS.textPrimary },

  voluntarioNote: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 14,
  },
  voluntarioNoteText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
