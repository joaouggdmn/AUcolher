import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'

// Âmbar é reservado para as ações do AUmatch; o resto da home usa
// esmeralda e branco — é isso que mantém a hierarquia legível
const VARIANTS = {
  amber:
    'bg-accent-400 font-extrabold text-brand-950 hover:bg-accent-500',
  outline: 'border border-line-strong bg-white font-bold text-brand-700 hover:border-brand-700 hover:bg-brand-50',
  outlineDark: 'border border-white/30 font-bold text-white hover:border-white/60 hover:bg-white/10',
  emerald: 'bg-brand-700 font-bold text-white hover:bg-brand-800',
}

// Padding menor no mobile: com o respiro do card escuro, "Começar meu
// AUmatch" quebrava em duas linhas numa tela de 390px
const SIZES = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-12 px-5 text-base sm:h-14 sm:px-7',
}

// `action` = { label, to, state?, badge? } — o mesmo formato de
// data/personaActions.js. `to` pode ser uma âncora da home (#atalhos)
function ActionLink({ action, variant = 'amber', size = 'lg', icon, showArrow = variant === 'amber', className = '' }) {
  const Icon = icon ?? (variant === 'amber' ? LuSparkles : null)

  return (
    <Link
      to={action.to}
      state={action.state}
      className={`group inline-flex w-full items-center justify-center gap-2.5 rounded-control text-center leading-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 sm:w-auto ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {Icon && (
        <Icon aria-hidden="true" size={17} className="shrink-0" />
      )}
      {action.label}
      {action.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-[11px] font-bold text-white">
          {action.badge > 9 ? '9+' : action.badge}
          <span className="sr-only"> {action.badge === 1 ? 'novo' : 'novos'}</span>
        </span>
      )}
      {showArrow && (
        <FaArrowRight aria-hidden="true" size={14} className="shrink-0" />
      )}
    </Link>
  )
}

export function ActionSkeleton({ className = '' }) {
  return <div aria-hidden="true" className={`h-12 w-56 rounded-control bg-line/70 motion-safe:animate-pulse sm:h-14 ${className}`} />
}

export default ActionLink
