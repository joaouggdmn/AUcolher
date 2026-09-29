// Mesma leitura de cores do "Por que deu match?" (MatchReasonsModal): verde
// para o critério cravado, âmbar para o parcial, cinza para o que não somou.
// A cor é sempre redundante com o texto de pontos, nunca a única pista
const TONES = {
  light: {
    full: { bar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' },
    partial: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', icon: 'text-amber-500' },
    none: { bar: 'bg-slate-200', badge: 'bg-slate-100 text-slate-500', icon: 'text-slate-400' },
  },
  dark: {
    full: { bar: 'bg-emerald-400', badge: 'bg-emerald-400/15 text-emerald-200', icon: 'text-emerald-300' },
    partial: { bar: 'bg-amber-400', badge: 'bg-amber-400/15 text-amber-300', icon: 'text-amber-300' },
    none: { bar: 'bg-white/15', badge: 'bg-white/10 text-emerald-100/70', icon: 'text-emerald-100/40' },
  },
}

export function toneFor(ratio, variant = 'light') {
  const palette = TONES[variant] ?? TONES.light
  if (ratio >= 1) return palette.full
  if (ratio > 0) return palette.partial
  return palette.none
}
