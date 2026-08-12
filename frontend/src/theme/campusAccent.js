// Deriva, a partir da corTema de um campus (ex: "#8ea7a1"), os tons usados
// nos elementos que representam "o campus do usuário": card do próximo
// culto, tag do campus, CTA principal, item ativo da bottom nav.
//
// Conteúdo que NÃO é específico do campus do usuário (ex: card de série
// vindo de outro campus na navegação cross-campus) deve continuar neutro —
// não chame essa função pra esses casos, senão a cor de um campus "vaza"
// pra conteúdo que não é dele.
//
// getCampusAccent('#8ea7a1') retorna:
//   base         -> a própria corTema, pra usar em backgrounds sólidos (CTA)
//   light        -> versão clareada, pra texto/ícone em cima do fundo escuro
//   glow(opac)   -> função que retorna a cor em rgba(), pra bordas em
//                   degradê e sombras/glow (opac default = 0.35)
//   textOnAccent -> preto ou branco (calculado por contraste), pro texto
//                   ficar legível em cima do botão/card sólido na cor

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Mistura a cor com branco — usada pro tom claro (texto/ícone sobre o fundo escuro)
function lighten(hex, amount = 0.35) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  });
}

// Luminância relativa (fórmula WCAG) — decide se o texto em cima da cor
// sólida deve ser escuro ou claro
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getCampusAccent(corTema) {
  const { r, g, b } = hexToRgb(corTema);
  return {
    base: corTema,
    light: lighten(corTema, 0.3),
    glow: (opacity = 0.35) => `rgba(${r}, ${g}, ${b}, ${opacity})`,
    textOnAccent: luminance(corTema) > 0.45 ? '#16211D' : '#F5F6F8',
  };
}