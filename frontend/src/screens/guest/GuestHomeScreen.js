import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../../theme/colors';

const OPTIONS = [
  {
    key: 'biblia',
    icon: 'book',
    titulo: 'Bíblia',
    descricao: 'Leia a Palavra livremente, sem precisar de conta.',
    screen: 'Biblia',
  },
  {
    key: 'sobre',
    icon: 'information-circle',
    titulo: 'Sobre a United',
    descricao: 'Conheça nossa visão, missão e história.',
    screen: 'SobreUnited',
  },
  {
    key: 'campi',
    icon: 'location',
    titulo: 'Encontre um campus',
    descricao: 'Veja endereço, pastores e horários de culto.',
    screen: 'CampusList',
  },
];

export default function GuestHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>untd.</Text>
          <Text style={styles.subtitle}>Dê uma olhada antes de entrar.</Text>
        </View>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(opt.screen)}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={opt.icon} size={22} color={COLORS.textPrimary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitulo}>{opt.titulo}</Text>
              <Text style={styles.cardDescricao}>{opt.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 110 },
  header: { marginTop: 40, marginBottom: 32 },
  wordmark: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitulo: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  cardDescricao: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loginButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.background,
  },
});