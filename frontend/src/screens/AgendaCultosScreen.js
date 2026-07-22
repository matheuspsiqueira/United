import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS } from '../theme/colors';
import { AGENDA_CULTOS } from '../data/mockData';

const STATUS_LABEL = {
  normal: null,
  alterado: 'Alterado',
  cancelado: 'Cancelado',
};

const STATUS_COLOR = {
  alterado: '#F18F01',
  cancelado: COLORS.danger,
};

export default function AgendaCultosScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {AGENDA_CULTOS.map((item) => (
        <View key={item.id} style={styles.row}>
          <View>
            <Text style={styles.data}>{item.data}</Text>
            <Text style={styles.hora}>{item.hora}</Text>
          </View>
          {item.status !== 'normal' && (
            <View style={styles.avisoContainer}>
              <Text style={[styles.avisoLabel, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
              {item.observacao && <Text style={styles.observacao}>{item.observacao}</Text>}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  data: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  hora: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  avisoContainer: { alignItems: 'flex-end', maxWidth: '55%' },
  avisoLabel: { fontSize: 12, fontWeight: '700' },
  observacao: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textAlign: 'right' },
});
