import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';

// SKELETON — a implementação completa (66 livros via API externa, versões
// NVI/NTLH, grifo de versículos com 5 cores, favoritos) fica para a próxima
// sessão de desenvolvimento, após a definição final da API bíblica.
export default function BibliaScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Bíblia</Text>
      <View style={styles.placeholder}>
        <Ionicons name="book-outline" size={48} color={COLORS.textSecondary} />
        <Text style={styles.placeholderText}>
          Tela em construção — leitura completa, versões NVI/NTLH e favoritos
          serão implementados na próxima etapa.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 12 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  placeholderText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
});
