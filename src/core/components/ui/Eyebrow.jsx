import { LuSparkles } from 'react-icons/lu'

// amber-700 (e não 600) no fundo claro: texto pequeno precisa de 4.5:1
const TONES = {
  light: 'text-amber-700',
  dark: 'text-amber-400',
}

const SIZES = {
  md: { text: 'text-sm', icon: 15 },
  sm: { text: 'text-xs', icon: 13 },
}

// Frase de destaque acima de um título: dourada e sem fundo, só o texto e o
// brilho. `tone` é o fundo sobre o qual ela aparece
function Eyebrow({ children, tone = 'light', size = 'md' }) {
  const styles = SIZES[size]

  return (
    <span className={`inline-flex max-w-full items-center gap-2 font-semibold ${styles.text} ${TONES[tone]}`}>
      <LuSparkles aria-hidden="true" size={styles.icon} className="shrink-0" />
      {children}
    </span>
  )
}

export default Eyebrow
