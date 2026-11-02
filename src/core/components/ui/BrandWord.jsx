// Palavras da marca ("AU" + colher, migo). Logo e títulos passam sempre por
// aqui, para a marca não ter um tom diferente em cada tela. `tone` é o fundo
// sobre o qual a palavra aparece
const TONES = {
  light: { prefix: 'text-emerald-900', suffix: 'text-amber-500' },
  dark: { prefix: 'text-white', suffix: 'text-amber-400' },
}

function BrandWord({ suffix = 'colher', tone = 'light' }) {
  const colors = TONES[tone]

  return (
    <>
      <span className={`transition-colors duration-300 ${colors.prefix}`}>AU</span>
      <span className={`transition-colors duration-300 ${colors.suffix}`}>{suffix}</span>
    </>
  )
}

export default BrandWord
