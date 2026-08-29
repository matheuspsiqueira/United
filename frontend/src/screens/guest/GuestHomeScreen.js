import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../../theme/colors';
import GlassSurface from '../../components/GlassSurface';

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
  const insets = useSafeAreaInsets();

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
            activeOpacity={0.8}
            onPress={() => navigation.navigate(opt.screen)}
          >
            <GlassSurface style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name={opt.icon} size={22} color={COLORS.textPrimary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitulo}>{opt.titulo}</Text>
                <Text style={styles.cardDescricao}>{opt.descricao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </GlassSurface>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <GlassSurface
        style={{ ...styles.footer, paddingBottom: 24 + insets.bottom }}
        intensity={40}
        scrimOpacity={0.75}
      >
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 130 },
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    borderRadius: 0,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingHorizontal: 20,
    paddingTop: 20,
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