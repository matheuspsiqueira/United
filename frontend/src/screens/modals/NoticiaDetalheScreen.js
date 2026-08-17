import React, {useCallback} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS } from '../../theme/colors';
import { getCampusAccent } from '../../theme/campusAccent';

export default function NoticiaDetalheScreen({ route, navigation }) {
  const { noticia } = route.params;
  const accent = getCampusAccent(noticia.campus.corTema);

    useFocusEffect(
      useCallback(() => {
        if (Platform.OS !== 'android') return undefined;
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('overlay-swipe');
        return () => {
          NavigationBar.setVisibilityAsync('visible');
        };
      }, [])
    );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notícia</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.campusTag, { backgroundColor: accent.glow(0.16) }]}>
          <View style={[styles.campusDot, { backgroundColor: accent.base }]} />
          <Text style={[styles.campusTagText, { color: accent.light }]}>{noticia.campus.nome}</Text>
        </View>

        <Text style={styles.titulo}>{noticia.titulo}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{formatarData(noticia.data)}</Text>
        </View>

        <Text style={styles.corpo}>{noticia.conteudo}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
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

  campusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  campusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  campusTagText: { fontFamily: FONTS.bodySemiBold, fontSize: 12 },

  titulo: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.textPrimary, marginTop: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  infoText: { fontFamily: FONTS.bodyRegular, fontSize: 14, color: COLORS.textSecondary, marginLeft: 8 },

  corpo: { fontFamily: FONTS.bodyRegular, fontSize: 14, color: COLORS.textPrimary, lineHeight: 21, marginTop: 20 },
});