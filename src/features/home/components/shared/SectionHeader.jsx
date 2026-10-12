// amber-700 (e não 600) no fundo claro: texto pequeno precisa de 4.5:1
const TONES = {
  light: { eyebrow: 'text-amber-700', title: 'text-emerald-950', subtitle: 'text-slate-600' },
  dark: { eyebrow: 'text-amber-400', title: 'text-white', subtitle: 'text-emerald-100/70' },
}

// Cabeçalho padrão das seções da home: eyebrow + h2 + subtítulo. O `id` vai
// no h2 para a <section aria-labelledby> apontar para ele
function SectionHeader({ id, eyebrow, title, subtitle, tone = 'light', align = 'left', className = '' }) {
  const colors = TONES[tone]
  const isCentered = align === 'center'

  return (
    <div className={`${isCentered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <p className={`text-sm font-semibold uppercase tracking-wide ${colors.eyebrow}`}>{eyebrow}</p>
      )}
      <h2 id={id} className={`mt-2 text-3xl font-black tracking-tight text-balance sm:text-4xl ${colors.title}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${colors.subtitle} ${isCentered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
