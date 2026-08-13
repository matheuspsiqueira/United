import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

// Vidro "de verdade" tem 4 camadas, não uma cor translúcida sozinha:
//   1. BlurView — borra o que tá atrás (no Android só borra de verdade
//      com `experimentalBlurMethod`, em aparelhos Android 12+; em
//      aparelhos mais antigos ele cai num fallback mais fraco — é
//      limitação do SO, não dá pra forçar)
//   2. Scrim escuro — SEM essa camada, se o que tá atrás do card for
//      claro/colorido (ex: o glow de fundo da Home), o blur "puxa" esse
//      brilho pro card e o texto branco em cima perde contraste. O scrim
//      garante uma base escura consistente, não importa o que tem atrás.
//   3. Degradê branco bem sutil por cima — dá a sensação de espessura/
//      brilho de vidro, sem competir com o texto.
//   4. Borda de 1px translúcida fechando o contorno.
//
// Uso: <GlassSurface style={styles.card}>{...conteúdo...}</GlassSurface>
// `style` controla borderRadius/padding/etc do card como um todo.
export default function GlassSurface({ style, intensity = 30, scrimOpacity = 0.65, children }) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: COLORS.background, opacity: scrimOpacity },
        ]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden', // essencial: clipa o blur e o degradê nos cantos arredondados
  },
});