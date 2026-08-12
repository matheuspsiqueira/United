import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import EditarDadosModal from './modals/EditarDadosPessoais';
import VersiculosFavoritosModal from './modals/VersiculosFavoritos';

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();
  const [modalDadosVisivel, setModalDadosVisivel] = useState(false);
  const [modalVersiculosVisivel, setModalVersiculosVisivel] = useState(false);

  if (!usuario) return null;

  const campus = usuario.campus;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.avatarSection}>
        <View style={[styles.avatarPlaceholder, { borderColor: campus?.corTema || COLORS.border }]}>
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
        <View style={[styles.roleBadge, { backgroundColor: campus?.corTema || COLORS.surface }]}>
          <Text style={styles.roleBadgeText}>
            {usuario.role === 'voluntario' ? 'Voluntário' : 'Membro'}
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="bookmark-outline" label="Versículos favoritos" onPress={() => setModalVersiculosVisivel(true)} />
        <MenuItem icon="create-outline" label="Editar dados pessoais" onPress={() => setModalDadosVisivel(true)} />

        {usuario.role !== 'voluntario' && (
          <View style={styles.voluntarioNote}>
            <Text style={styles.voluntarioNoteText}>
              Funcionalidades de voluntário (escala, check-in) aparecerão aqui
              assim que sua participação for aprovada na Feira de Voluntários.
            </Text>
          </View>
        )}

        <MenuItem icon="log-out-outline" label="Sair" danger onPress={logout} />
      </View>

      <EditarDadosModal visible={modalDadosVisivel} onClose={() => setModalDadosVisivel(false)} />
      <VersiculosFavoritosModal visible={modalVersiculosVisivel} onClose={() => setModalVersiculosVisivel(false)} />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, danger, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  nome: { fontSize: 18, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  campusNome: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { color: '#FFF', fontSize: 12, fontFamily: FONTS.bodySemiBold },

  menu: { paddingHorizontal: 16, marginTop: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLabel: { marginLeft: 12, fontSize: 15, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },

  voluntarioNote: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 14,
  },
  voluntarioNoteText: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, lineHeight: 18 },
});