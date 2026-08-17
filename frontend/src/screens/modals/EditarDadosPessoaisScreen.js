import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONTS } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

export default function EditarDadosPessoaisScreen({ navigation }) {
  const { usuario, atualizarPerfil, trocarSenha } = useAuth();

  const [nomeCompleto, setNomeCompleto] = useState(usuario?.nome_completo || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [fotoUri, setFotoUri] = useState(null);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState(null);
  const [senhaOk, setSenhaOk] = useState(false);

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
    }
  };

  const salvarDados = async () => {
    setErroDados(null);
    setSalvandoDados(true);
    try {
      await atualizarPerfil({ nomeCompleto, email, fotoUri });
      setFotoUri(null);
    } catch (e) {
      setErroDados(e.message);
    } finally {
      setSalvandoDados(false);
    }
  };

  const salvarSenha = async () => {
    setErroSenha(null);

    if (novaSenha !== confirmarSenha) {
      setErroSenha('A confirmação não bate com a nova senha.');
      return;
    }

    setSalvandoSenha(true);
    try {
      await trocarSenha(senhaAtual, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setSenhaOk(true);
      setTimeout(() => setSenhaOk(false), 3000);
    } catch (e) {
      setErroSenha(e.message);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const fotoExibida = fotoUri || usuario?.foto_perfil || null;

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Editar dados</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={escolherFoto}>
            {fotoExibida ? (
              <Image source={{ uri: fotoExibida }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={COLORS.textSecondary} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color={COLORS.background} />
            </View>
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              placeholder="Nome completo"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {erroDados && <Text style={styles.erroText}>{erroDados}</Text>}

          <TouchableOpacity style={styles.button} onPress={salvarDados} disabled={salvandoDados}>
            {salvandoDados ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Salvar dados</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Trocar senha</Text>
          {usuario?.senha_temporaria && (
            <Text style={styles.avisoSenhaProvisoria}>
              Você está usando uma senha provisória. Recomendamos trocar agora.
            </Text>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Senha atual</Text>
            <TextInput
              style={styles.input}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar nova senha</Text>
            <TextInput
              style={styles.input}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              placeholder="Repita a nova senha"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {erroSenha && <Text style={styles.erroText}>{erroSenha}</Text>}
          {senhaOk && <Text style={styles.sucessoText}>Senha alterada com sucesso.</Text>}

          <TouchableOpacity style={styles.button} onPress={salvarSenha} disabled={salvandoSenha}>
            {salvandoSenha ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Trocar senha</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 20, paddingBottom: 40 },

  avatarWrapper: { alignSelf: 'center', marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.textPrimary,
    width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },

  field: { marginBottom: 16 },
  label: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: FONTS.bodyRegular, fontSize: 14, color: COLORS.textPrimary,
  },

  button: { backgroundColor: COLORS.textPrimary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.background },

  erroText: { fontFamily: FONTS.bodyRegular, fontSize: 13, color: COLORS.danger, marginBottom: 12 },
  sucessoText: { fontFamily: FONTS.bodyRegular, fontSize: 13, color: COLORS.success, marginBottom: 12 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 28 },
  sectionTitle: { fontFamily: FONTS.displaySemiBold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 8 },
  avisoSenhaProvisoria: {
    fontFamily: FONTS.bodyRegular, fontSize: 12, color: COLORS.textSecondary,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 16, lineHeight: 18,
  },
});