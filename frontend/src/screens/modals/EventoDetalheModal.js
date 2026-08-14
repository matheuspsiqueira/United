import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../../theme/colors';
import { getCampusAccent } from '../../theme/campusAccent';

export default function EventoDetalheModal({ visible, evento, onClose }) {
  if (!evento) return null;

  const accent = getCampusAccent(evento.campus.corTema);
  const gratuito = !evento.valor || Number(evento.valor) === 0;

  const abrirLinkIngresso = () => {
    if (evento.link_ingresso) Linking.openURL(evento.link_ingresso);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Evento</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {evento.capa ? (
            <Image source={{ uri: evento.capa }} style={styles.capa} />
          ) : (
            <View style={[styles.capaPlaceholder, { backgroundColor: accent.glow(0.2) }]} />
          )}

          <View style={[styles.campusTag, { backgroundColor: accent.glow(0.16) }]}>
            <View style={[styles.campusDot, { backgroundColor: accent.base }]} />
            <Text style={[styles.campusTagText, { color: accent.light }]}>{evento.campus.nome}</Text>
          </View>

          <Text style={styles.titulo}>{evento.titulo}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {formatarData(evento.data)}{evento.horario ? ` às ${evento.horario.slice(0, 5)}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{gratuito ? 'Gratuito' : formatarValor(evento.valor)}</Text>
          </View>

          <Text style={styles.descricao}>{evento.descricao}</Text>

          {evento.link_ingresso && (
            <TouchableOpacity
              style={[styles.buyButton, { backgroundColor: accent.base }]}
              onPress={abrirLinkIngresso}
            >
              <Text style={[styles.buyButtonText, { color: accent.textOnAccent }]}>
                Comprar ingresso
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontFamily: FONTS.displaySemiBold, fontSize: 18, color: COLORS.textPrimary },
  content: { padding: 20, paddingBottom: 40 },

  capa: { width: '100%', height: 180, borderRadius: 16 },
  capaPlaceholder: { width: '100%', height: 140, borderRadius: 16 },

  campusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
  },
  campusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  campusTagText: { fontFamily: FONTS.bodySemiBold, fontSize: 12 },

  titulo: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginTop: 12,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  infoText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  descricao: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 21,
    marginTop: 20,
  },

  buyButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  buyButtonText: { fontFamily: FONTS.bodySemiBold, fontSize: 15 },
});