import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { getGrifos, removerGrifoApi } from '../../services/versiculosApi';
import { getVersiculo } from '../../services/bibliaApi';

function nomeLocalizado(campo) {
  if (!campo) return '';
  if (typeof campo === 'string') return campo;
  return campo['pt-br'] || campo.pt || campo.en || Object.values(campo)[0] || '';
}

export default function VersiculosFavoritosScreen({ navigation }) {
  const { token } = useAuth();

  const [itens, setItens] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState(null);

  const carregar = useCallback(async () => {
    if (!token) return;
    setCarregandoLista(true);
    setErroLista(null);
    try {
      const favoritos = await getGrifos(token);

      const base = favoritos
        .map((f) => {
          const [versao, livroSlug, capitulo, numero] = f.verse_id.split('|');
          if (!versao || !livroSlug || !capitulo || !numero) return null;
          return {
            verseId: f.verse_id,
            cor: f.cor,
            versao,
            livroSlug,
            capitulo: Number(capitulo),
            numero: Number(numero),
            texto: null,
            nomeLivro: livroSlug,
            carregando: true,
            erro: false,
          };
        })
        .filter(Boolean);

      setItens(base);

      base.forEach((item, index) => {
        getVersiculo(item.versao, item.livroSlug, item.capitulo, item.numero)
          .then((data) => {
            const versiculo = Array.isArray(data?.verses) ? data.verses[0] : data;
            const texto = typeof versiculo === 'string' ? versiculo : versiculo?.text || '';
            const nomeLivro = nomeLocalizado(data?.book?.name) || item.livroSlug;
            setItens((atual) => {
              const copia = [...atual];
              copia[index] = { ...copia[index], texto, nomeLivro, carregando: false };
              return copia;
            });
          })
          .catch(() => {
            setItens((atual) => {
              const copia = [...atual];
              copia[index] = { ...copia[index], carregando: false, erro: true };
              return copia;
            });
          });
      });
    } catch (e) {
      setErroLista(e.message || 'Não foi possível carregar seus versículos favoritos.');
    } finally {
      setCarregandoLista(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const remover = async (verseId) => {
    setItens((atual) => atual.filter((i) => i.verseId !== verseId));
    try {
      await removerGrifoApi(token, verseId);
    } catch (e) {
      carregar();
    }
  };

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
        <Text style={styles.headerTitle}>Versículos favoritos</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {carregandoLista ? (
        <View style={styles.centro}>
          <ActivityIndicator color={COLORS.textPrimary} />
        </View>
      ) : erroLista ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={36} color={COLORS.textSecondary} />
          <Text style={styles.erroTexto}>{erroLista}</Text>
        </View>
      ) : itens.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="bookmark-outline" size={36} color={COLORS.textSecondary} />
          <Text style={styles.vazioTexto}>
            Você ainda não grifou nenhum versículo. Toque em um versículo na Bíblia pra favoritar.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {itens.map((item) => (
            <View key={item.verseId} style={styles.card}>
              <View style={[styles.corBarra, { backgroundColor: item.cor }]} />
              <View style={styles.cardConteudo}>
                <Text style={styles.referencia}>
                  {item.nomeLivro} {item.capitulo}:{item.numero} · {item.versao.toUpperCase()}
                </Text>
                {item.carregando ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} style={{ marginTop: 6 }} />
                ) : item.erro ? (
                  <Text style={styles.textoErro}>Não foi possível carregar o texto.</Text>
                ) : (
                  <Text style={styles.texto}>{item.texto}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => remover(item.verseId)} style={styles.removerBtn}>
                <Ionicons name="close-circle-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
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

  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 10 },
  erroTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center', fontSize: 14 },
  vazioTexto: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, textAlign: 'center', fontSize: 14, lineHeight: 20 },

  lista: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, overflow: 'hidden' },
  corBarra: { width: 4 },
  cardConteudo: { flex: 1, padding: 14 },
  referencia: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 6 },
  texto: { fontFamily: FONTS.bodyRegular, fontSize: 15, lineHeight: 22, color: COLORS.textPrimary },
  textoErro: { fontFamily: FONTS.bodyRegular, fontSize: 13, color: COLORS.danger, marginTop: 4 },
  removerBtn: { justifyContent: 'center', paddingHorizontal: 14 },
});