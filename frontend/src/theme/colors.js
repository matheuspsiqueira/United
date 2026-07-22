// Paleta dark do app + famílias de fonte centralizadas.
// A cor de destaque (accent) varia por campus — veja `corTema` em cada
// objeto de CAMPUSES (mockData.js). As cores de campus já foram escolhidas
// para funcionar bem sobre este fundo escuro.

export const COLORS = {
  background: '#0B0D12',       // fundo geral do app
  surface: '#161922',          // cards
  surfaceElevated: '#1F2430',  // cards em destaque / elementos elevados
  textPrimary: '#F5F6F8',
  textSecondary: '#9099AC',
  border: '#252A38',
  danger: '#E5484D',
  success: '#2D9D5F',
};

// Nomes das famílias de fonte, conforme carregadas via @expo-google-fonts
// no App.js (ex: Sora_700Bold). Centralizamos aqui pra evitar strings soltas
// espalhadas pelas telas.
export const FONTS = {
  displayBold: 'Sora_700Bold',
  displaySemiBold: 'Sora_600SemiBold',
  displayRegular: 'Sora_400Regular',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
};