import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  login as loginApi,
  getMe,
  trocarSenha as trocarSenhaApi,
  atualizarPerfil as atualizarPerfilApi,
} from '../services/usuariosApi';

const TOKEN_KEY = '@united:auth:token';

const AuthContext = createContext(null);

function avisarSenhaTemporaria() {
  Alert.alert(
    'Senha provisória',
    'Você ainda está usando a senha provisória. Troque assim que possível no seu perfil.',
  );
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const dadosUsuario = await getMe(savedToken);
        setToken(savedToken);
        tokenRef.current = savedToken;
        setUsuario(dadosUsuario);
        if (dadosUsuario.senha_temporaria) avisarSenhaTemporaria();
      } catch (e) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState !== 'active' || !tokenRef.current) return;
      try {
        const dadosUsuario = await getMe(tokenRef.current);
        setUsuario(dadosUsuario);
        if (dadosUsuario.senha_temporaria) avisarSenhaTemporaria();
      } catch (e) {
        // falha silenciosa; próxima ação que exigir auth pega o erro
      }
    });
    return () => subscription.remove();
  }, []);

  const login = useCallback(async (username, password) => {
    const { token: novoToken, usuario: dadosUsuario } = await loginApi(username, password);
    await AsyncStorage.setItem(TOKEN_KEY, novoToken);
    setToken(novoToken);
    tokenRef.current = novoToken;
    setUsuario(dadosUsuario);
    if (dadosUsuario.senha_temporaria) avisarSenhaTemporaria();
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    tokenRef.current = null;
    setUsuario(null);
  }, []);

  const trocarSenha = useCallback(async (senhaAtual, novaSenha) => {
    const dadosUsuario = await trocarSenhaApi(tokenRef.current, senhaAtual, novaSenha);
    setUsuario(dadosUsuario);
  }, []);

  const atualizarPerfil = useCallback(async (dados) => {
    const dadosUsuario = await atualizarPerfilApi(tokenRef.current, dados);
    setUsuario(dadosUsuario);
  }, []);

  const refreshUsuario = useCallback(async () => {
    if (!tokenRef.current) return;
    const dadosUsuario = await getMe(tokenRef.current);
    setUsuario(dadosUsuario);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario, token, loading, isAuthenticated: !!token,
        login, logout, trocarSenha, atualizarPerfil, refreshUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider');
  return ctx;
}