import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { listarEventos } from '../services/conteudoApi';
import EventoDetalheModal from './modals/EventoDetalheModal';

export default function EventosScreen({ route, navigation }) {
  const { token } = useAuth();
  const campusIdFiltro = route?.params?.campusId ?? null;
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarEventos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await listarEventos(token);
      setEventos(dados);
    } catch (e) {
      setErro('Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  const secoes = useMemo(() => {
    const filtrados = campusIdFiltro
      ? eventos.filter((e) => e.campus.id === campusIdFiltro)
      : eventos;

    const porCampus = new Map();
    filtrados.forEach((evento) => {
      const chave = evento.campus.id;
      if (!porCampus.has(chave)) {
        porCampus.set(chave, { campus: evento.campus, title: evento.campus.nome, data: [] });
      }
      porCampus.get(chave).data.push(evento);
    });

    return Array.from(porCampus.values());
  }, [eventos, campusIdFiltro]);

  useEffect(() => {
    const campus = campusIdFiltro
      ? eventos.find((e) => e.campus.id === campusIdFiltro)?.campus
      : null;
    navigation.setOptions({
      title: campus ? `Eventos — ${campus.nome}` : 'Eventos',
    });
  }, [campusIdFiltro, eventos]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{erro}</Text>
          <TouchableOpacity onPress={carregarEventos} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <SectionList
        sections={secoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento programado no momento.</Text>
        }
        renderSectionHeader={({ section }) => {
          const accent = getCampusAccent(section.campus.corTema);
          return (
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: accent.base }]} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          );
        }}
        renderItem={({ item, section }) => {
          const accent = getCampusAccent(section.campus.corTema);
          return (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setEventoSelecionado(item)}>
              <GlassSurface style={styles.card} scrimOpacity={0.4}>
                {item.capa ? (
                  <Image
                    source={{ uri: item.capa, headers: { 'ngrok-skip-browser-warning': 'true' } }}
                    style={styles.capa}
                  />
                ) : (
                  <View style={[styles.capaPlaceholder, { backgroundColor: accent.glow(0.18) }]} />
                )}
                <View style={styles.cardInfo}>
                  <Text style={[styles.data, { color: accent.light }]}>
                    {formatarData(item.data)}{item.horario ? ` · ${item.horario.slice(0, 5)}` : ''}
                  </Text>
                  <Text style={styles.titulo}>{item.titulo}</Text>
                  <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>
                </View>
              </GlassSurface>
            </TouchableOpacity>
          );
        }}
      />

      <EventoDetalheModal
        visible={!!eventoSelecionado}
        evento={eventoSelecionado}
        onClose={() => setEventoSelecionado(null)}
      />
    </SafeAreaView>
  );
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 130 },
  emptyText: {
    fontSize: 14, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary,
    textAlign: 'center', marginTop: 40,
  },
  retryButton: { marginTop: 16 },
  retryText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.textPrimary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sectionTitle: { fontSize: 15, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  capa: { width: '100%', height: 140 },
  capaPlaceholder: { width: '100%', height: 100 },
  cardInfo: { padding: 14 },
  data: { fontSize: 12, fontFamily: FONTS.mono },
  titulo: { fontSize: 16, fontFamily: FONTS.displaySemiBold, color: COLORS.textPrimary, marginTop: 4 },
  descricao: { fontSize: 13, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 4 },
});