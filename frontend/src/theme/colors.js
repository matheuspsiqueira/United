// Paleta dark do app + famílias de fonte centralizadas.
// A cor de destaque (accent) varia por campus — veja `corTema` em cada
// campus retornado pela API. Pra derivar tons de vidro/glow/contraste
// a partir do corTema, use `getCampusAccent()` em `theme/campusAccent.js`
// — não use o hex do corTema direto em backgrounds sólidos.

export const COLORS = {
  background: '#0B0D12',        // fundo geral do app
  backgroundGlowTop: '#14101F', // topo do degradê sutil de fundo (Home)
  backgroundGlowBottom: '#0E1613', // base do degradê sutil de fundo (Home)
  surface: '#161922',           // cards (telas que ainda não migraram pra vidro)
  surfaceElevated: '#1F2430',   // cards em destaque / elementos elevados
  textPrimary: '#F5F6F8',
  textSecondary: '#9099AC',
  border: '#252A38',
  danger: '#E5484D',
  success: '#2D9D5F',

  // Vidro (glassmorphism) — usar como backgroundColor de uma View
  // envolvida por <BlurView intensity={20-40} tint="dark">.
  glassFill: 'rgba(255,255,255,0.055)',
  glassFillElevated: 'rgba(255,255,255,0.09)',
  glassBorder: 'rgba(255,255,255,0.10)',
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

// Tons pra grifo de versículo — abafados de propósito, pra não competir
// com o texto num fundo escuro. Usados no menu flutuante de 5 cores.
export const HIGHLIGHT_COLORS = {
  amber:  '#D9A441',
  rose:   '#D97C86',
  teal:   '#4FA6A0',
  violet: '#9B8AD9',
  sage:   '#7FA66B',
};