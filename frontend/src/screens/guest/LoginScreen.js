import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS, FONTS } from '../../theme/colors';

export default function LoginScreen({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = () => {
    // MOCK: qualquer valor loga com sucesso, só pra validar a transição
    // Guest -> Home. Quando o backend existir, entra aqui a chamada real
    // ao DRF (POST /api/auth/login/) e o tratamento de erro de credenciais.
    onLoginSuccess();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Acesse sua conta United.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Usuário</Text>
        <TextInput
          style={styles.input}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          placeholder="seu.usuario"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 32 },
  title: { fontFamily: FONTS.displayBold, fontSize: 26, color: COLORS.textPrimary },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 28,
  },
  field: { marginBottom: 18 },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.background,
  },
});