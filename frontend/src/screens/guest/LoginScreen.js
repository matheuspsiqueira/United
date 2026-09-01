import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import GlassSurface from '../../components/GlassSurface';

export default function LoginScreen() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!usuario || !senha) return;
    setErro(null);
    setLoading(true);
    try {
      await login(usuario, senha);
      // isAuthenticated vira true no contexto -> AppNavigator troca
      // pro RootNavigator sozinho, sem precisar navegar manualmente aqui.
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
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
        <GlassSurface style={styles.inputWrap} intensity={20}>
          <TextInput
            style={styles.input}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            placeholder="seu.usuario"
            placeholderTextColor={COLORS.textSecondary}
          />
        </GlassSurface>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha</Text>
        <GlassSurface style={styles.inputWrap} intensity={20}>
          <View style={styles.senhaRow}>
            <TextInput
              style={[styles.input, styles.inputSenha]}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!verSenha}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity
              style={styles.olhoBotao}
              onPress={() => setVerSenha((v) => !v)}
            >
              <Ionicons
                name={verSenha ? 'eye-off' : 'eye'}
                size={19}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </GlassSurface>
      </View>

      {erro && <Text style={styles.erroText}>{erro}</Text>}

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
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
  inputWrap: {
    borderRadius: 10,
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSenha: {
    flex: 1,
  },
  olhoBotao: {
    paddingHorizontal: 14,
  },
  erroText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: 12,
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