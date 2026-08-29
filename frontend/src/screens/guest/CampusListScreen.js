import React from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../../theme/colors';
import { REGIOES, CAMPUSES } from '../../data/mockData';
import GlassSurface from '../../components/GlassSurface';

const sections = REGIOES.map((regiao) => ({
  title: regiao,
  data: CAMPUSES.filter((c) => c.regiao === regiao),
}));

export default function CampusListScreen({ navigation }) {
  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CampusDetail', { campusId: item.id })}
        >
          <GlassSurface style={styles.row}>
            <View style={[styles.spine, { backgroundColor: item.corTema }]} />
            <View style={styles.rowText}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.endereco} numberOfLines={1}>
                {item.endereco}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </GlassSurface>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  sectionHeader: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
  },
  spine: { width: 4, alignSelf: 'stretch' },
  rowText: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  nome: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  endereco: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});