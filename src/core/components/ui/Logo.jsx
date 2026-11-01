import { Link } from 'react-router-dom'

// "AU" na cor do fundo e "colher" em âmbar. `tone="light"` é para fundo
// escuro (footer, navbar rolada); o padrão é para fundo claro
const AU_TONES = {
  dark: 'text-brand-950',
  light: 'text-white',
}

const COLHER_TONES = {
  dark: 'text-accent-500',
  light: 'text-accent-400',
}

function Logo({ to = '/', tone = 'dark', className = 'text-2xl', onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label="AUcolher, página inicial"
      className={`flex items-center font-black tracking-tight ${className}`}
    >
      <span className={`transition-colors duration-300 ${AU_TONES[tone]}`}>AU</span>
      <span className={COLHER_TONES[tone]}>colher</span>
    </Link>
  )
}

export default Logo
