import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';
import {
  CAMPUSES,
  PROXIMO_CULTO,
  EVENTOS,
  SERIES,
  USUARIO_MOCK,
  getCampusById,
} from '../data/mockData';

export default function HomeScreen({ navigation }) {
  // No app real, o campus do usuário vem do estado global/auth.
  const [campusAtualId] = useState(USUARIO_MOCK.campusId);
  const campus = getCampusById(campusAtualId);
  const outrosCampuses = CAMPUSES.filter((c) => c.id !== campusAtualId);

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

        {/* Card Meu Campus */}
        <View style={[styles.campusCard, { borderColor: campus.corTema }]}>
          <View style={[styles.proximoCultoBanner, { backgroundColor: campus.corTema }]}>
            <Ionicons name="calendar" size={18} color="#FFF" />
            <Text style={styles.proximoCultoText}>
              Próximo culto: {formatarData(PROXIMO_CULTO.data)} às {PROXIMO_CULTO.hora}
            </Text>
          </View>

          <View style={styles.campusInfo}>
            <Text style={styles.pastorLabel}>
              {campus.pastores.length > 1 ? 'Pastores' : 'Pastor'}
            </Text>
            <Text style={styles.pastorNome}>{campus.pastores.join(' & ')}</Text>

            <Text style={styles.enderecoText}>{campus.endereco}</Text>

            <View style={styles.divider} />

            <Text style={styles.horariosLabel}>Horários de culto</Text>
            {campus.horarios.map((h, idx) => (
              <View key={idx} style={styles.horarioRow}>
                <Text style={styles.horarioDia}>{h.dia}</Text>
                <Text style={styles.horarioHora}>{h.hora}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Próximos eventos — renderização condicional */}
        {eventosDoCampus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximos eventos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {eventosDoCampus.map((evento) => (
                <View key={evento.id} style={styles.eventoCard}>
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
              style={styles.destaqueCard}
              onPress={() => navigation.getParent()?.navigate('Series')}
            >
              <View style={[styles.destaqueCapa, { backgroundColor: campus.corTema }]}>
                <Ionicons name="play" size={28} color="#FFF" />
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
              icon="book-outline"
              label="Bíblia"
              onPress={() => navigation.getParent()?.navigate('Biblia')}
            />
            <AcessoRapidoItem
              icon="newspaper-outline"
              label="Notícias"
              onPress={() => navigation.navigate('Noticias')}
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
              <TouchableOpacity key={c.id} style={styles.chip}>
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
  headerCampus: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 12 },

  campusCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  proximoCultoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  proximoCultoText: { color: '#FFF', fontWeight: '600', marginLeft: 8, fontSize: 13 },
  campusInfo: { padding: 16 },
  pastorLabel: { fontSize: 12, color: COLORS.textSecondary },
  pastorNome: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
  enderecoText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  horariosLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  horarioDia: { fontSize: 14, color: COLORS.textPrimary },
  horarioHora: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },

  eventoCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  eventoData: { fontSize: 12, color: COLORS.textSecondary },
  eventoTitulo: { fontSize: 14, fontWeight: '600', marginTop: 4, color: COLORS.textPrimary },
  eventoDescricao: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  destaqueCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  destaqueCapa: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  destaqueInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  destaqueMes: { fontSize: 11, color: COLORS.textSecondary },
  destaqueTitulo: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  destaqueEpisodios: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemLabel: { marginTop: 8, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },

  exploreSection: { marginTop: 20, marginBottom: 24, paddingLeft: 16 },
  exploreLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
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
  chipText: { fontSize: 13, color: COLORS.textPrimary },
});
