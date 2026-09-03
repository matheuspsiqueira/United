import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../theme/colors';
import { getCampusAccent } from '../theme/campusAccent';
import GlassSurface from '../components/GlassSurface';
import { useAuth } from '../contexts/AuthContext';
import { listarUGroups } from '../services/ugroupsApi';

const HERO_IMAGE = require('../assets/ugroups-hero.png');

const DIA_CURTO = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

function formatarHorario(horarioStr) {
  // vem como "20:00:00" da API (DRF TimeField)
  const [hora, minuto] = horarioStr.split(':');
  return minuto === '00' ? `${parseInt(hora, 10)}h` : `${parseInt(hora, 10)}h${minuto}`;
}

function formatarLideres(lideres) {
  const nomes = lideres.map((l) => {
    const nomeCompleto = l.nome_completo ?? l.first_name ?? '';
    return nomeCompleto.split(' ')[0];
  });
  if (nomes.length === 0) return '';
  if (nomes.length === 1) return nomes[0];
  if (nomes.length === 2) return nomes.join(' e ');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

function UGroupsHero() {
  return (
    <View style={styles.hero}>
      <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(5,6,10,0.25)', 'rgba(5,6,10,0.92)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitulo}>uGroups são nossos cultos nos lares</Text>
      </View>
    </View>
  );
}

function UGroupRow({ grupo, accent, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{grupo.nome}</Text>
        {grupo.observacao ? <Text style={styles.observacao}>{grupo.observacao}</Text> : null}
        <Text style={styles.lideres}>{formatarLideres(grupo.lideres)}</Text>
      </View>
      <View style={styles.horarioBox}>
        <Text style={[styles.dia, { color: accent.light }]}>{DIA_CURTO[grupo.dia_semana]}</Text>
        <Text style={styles.horario}>{formatarHorario(grupo.horario)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default function UGroupsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario, token } = useAuth();
  const accent = usuario?.campus?.corTema
    ? getCampusAccent(usuario.campus.corTema)
    : getCampusAccent(null);

  const [uGroups, setUGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarUGroups(token);
      setUGroups(lista);
    } catch (e) {
      setErro('Não foi possível carregar os uGroups. Puxe pra atualizar.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.brandGlowTop, 'transparent']}
        style={styles.gradientTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', accent.glow(0.14)]}
        style={styles.gradientBottom}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 130 }}
      >
        <UGroupsHero />

        {loading ? (
          <ActivityIndicator color={accent.base} style={{ marginTop: 24 }} />
        ) : erro ? (
          <GlassSurface style={styles.erroCard}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={carregar} style={[styles.retryBtn, { backgroundColor: accent.base }]}>
              <Text style={[styles.retryTexto, { color: accent.textOnAccent }]}>Tentar de novo</Text>
            </TouchableOpacity>
          </GlassSurface>
        ) : uGroups.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum uGroup cadastrado no seu campus ainda.</Text>
        ) : (
          <GlassSurface style={styles.listCard}>
            {uGroups.map((grupo, index) => (
              <React.Fragment key={grupo.id}>
                <UGroupRow
                  grupo={grupo}
                  accent={accent}
                  onPress={() =>
                    navigation.getParent()?.getParent()?.navigate('UGroupDetalhe', { uGroupId: grupo.id })
                  }
                />
                {index < uGroups.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </GlassSurface>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320 },

  hero: {
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroContent: { flex: 1, justifyContent: 'flex-end', padding: 18 },
  heroTitulo: { fontSize: 20, fontFamily: FONTS.displayBold, color: COLORS.textPrimary, lineHeight: 26 },

  emptyText: {
    fontSize: 14, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary,
    textAlign: 'center', marginTop: 24,
  },
  erroCard: { padding: 20, alignItems: 'center', gap: 12 },
  erroTexto: { fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  retryTexto: { fontFamily: FONTS.bodySemiBold, fontSize: 13 },

  listCard: { paddingVertical: 4, paddingHorizontal: 4, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 10 },
  divider: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 12 },
  nome: { fontSize: 15, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary },
  observacao: { fontSize: 10, fontFamily: FONTS.mono, color: COLORS.textSecondary, marginTop: 1 },
  lideres: { fontSize: 12, fontFamily: FONTS.bodyRegular, color: COLORS.textSecondary, marginTop: 2 },
  horarioBox: { alignItems: 'flex-end', minWidth: 64 },
  dia: { fontSize: 11, fontFamily: FONTS.mono },
  horario: { fontSize: 11, fontFamily: FONTS.mono, color: COLORS.textSecondary },
});