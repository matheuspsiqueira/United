import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import {
  CAMPUSES,
  EVENTOS,
  SERIES,
  USUARIO_MOCK,
  getCampusById,
  getProximoCultoByCampus,
} from '../data/mockData';

export default function HomeScreen({ navigation }) {
  // No app real, o campus do usuário vem do estado global/auth.
  const [campusAtualId] = useState(USUARIO_MOCK.campusId);
  const campus = getCampusById(campusAtualId);
  const outrosCampuses = CAMPUSES.filter((c) => c.id !== campusAtualId);

  const proximoCulto = getProximoCultoByCampus(campusAtualId);
  const eventosDoCampus = EVENTOS.filter((e) => e.campusId === campusAtualId);
  const serieDestaque = SERIES.find((s) => s.campusId === campusAtualId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerCampus}>{campus.nome}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.getParent()?.navigate('Perfil')}
            >
              <Ionicons name="person-circle-outline" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Próximo culto — só lembrete, não navega */}
        {proximoCulto && (
          <View style={[styles.proximoCultoCard, { backgroundColor: campus.corTema }]}>
            <Ionicons name="calendar" size={18} color="#FFF" />
            <Text style={styles.proximoCultoText}>
              Próximo culto: {formatarData(proximoCulto.data)} às {proximoCulto.hora}
            </Text>
          </View>
        )}

        {/* Próximos eventos — renderização condicional, título navega pra Eventos */}
        {eventosDoCampus.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Próximos eventos</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {eventosDoCampus.map((evento) => (
                <View
                  key={evento.id}
                  style={[styles.eventoCard, { borderLeftColor: campus.corTema }]}
                >
                  <Text style={styles.eventoData}>{formatarData(evento.data)}</Text>
                  <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                  <Text style={styles.eventoDescricao} numberOfLines={2}>
                    {evento.descricao}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Em destaque — série */}
        {serieDestaque && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Em destaque</Text>
            <TouchableOpacity
              style={[styles.destaqueCard, { borderLeftColor: campus.corTema }]}
              onPress={() => navigation.getParent()?.navigate('Series')}
            >
              <View style={styles.destaqueCapa}>
                <Ionicons name="play" size={28} color={campus.corTema} />
              </View>
              <View style={styles.destaqueInfo}>
                <Text style={styles.destaqueMes}>{serieDestaque.mes}</Text>
                <Text style={styles.destaqueTitulo}>{serieDestaque.titulo}</Text>
                <Text style={styles.destaqueEpisodios}>
                  {serieDestaque.episodios.length} episódios
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Acesso rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.gridContainer}>
            <AcessoRapidoItem
              icon="play-circle-outline"
              label="Séries"
              onPress={() => navigation.getParent()?.navigate('Series')}
            />
            <AcessoRapidoItem
              icon="newspaper-outline"
              label="Notícias"
              onPress={() => navigation.navigate('Noticias')}
            />
            <AcessoRapidoItem
              icon="megaphone-outline"
              label="Eventos"
              onPress={() => navigation.navigate('Eventos')}
            />
            <AcessoRapidoItem
              icon="book-outline"
              label="Bíblia"
              onPress={() => navigation.getParent()?.navigate('Biblia')}
            />
            <AcessoRapidoItem
              icon="location-outline"
              label="Sobre o Campus"
              onPress={() => navigation.navigate('SobreCampus')}
            />
            <AcessoRapidoItem
              icon="information-circle-outline"
              label="Sobre a United"
              onPress={() => navigation.navigate('SobreUnited')}
            />
          </View>
        </View>

        {/* Explorar outros campi — discreto */}
        <View style={styles.exploreSection}>
          <Text style={styles.exploreLabel}>Explorar outros campi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {outrosCampuses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.chip}
                onPress={() => navigation.navigate('SobreCampus', { campusId: c.id })}
              >
                <View style={[styles.chipDot, { backgroundColor: c.corTema }]} />
                <Text style={styles.chipText}>{c.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AcessoRapidoItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
      <Ionicons name={icon} size={26} color={COLORS.textPrimary} />
      <Text style={styles.gridItemLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCampus: { fontSize: 20, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 12 },

  proximoCultoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
  },
  proximoCultoText: {
    color: '#FFF',
    fontFamily: FONTS.bodySemiBold,
    marginLeft: 8,
    fontSize: 13,
  },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  // Cards com "channel spine": barra lateral fina na cor do campus,
  // reforçando a metáfora de streaming/TV guide.
  eventoCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 12,
    marginRight: 10,
  },
  eventoData: { fontSize: 12, fontFamily: FONTS.mono, color: COLORS.textSecondary },
  eventoTitulo: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  eventoDescricao: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  destaqueCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  destaqueCapa: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  destaqueInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  destaqueMes: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textSecondary },
  destaqueTitulo: {
    fontSize: 15,
    fontFamily: FONTS.displaySemiBold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  destaqueEpisodios: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemLabel: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },

  exploreSection: { marginTop: 20, marginBottom: 24, paddingLeft: 16 },
  exploreLabel: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  chipText: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textPrimary },
});