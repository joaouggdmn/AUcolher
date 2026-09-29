import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'

// Âmbar é reservado para as ações do AUmatch; o resto da home usa
// esmeralda e branco — é isso que mantém a hierarquia legível
const VARIANTS = {
  amber:
    'bg-gradient-to-r from-amber-400 to-amber-500 font-extrabold text-emerald-950 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400',
  outline: 'border border-slate-300 bg-white font-bold text-emerald-900 hover:border-emerald-700 hover:bg-emerald-50',
  outlineDark: 'border border-white/30 font-bold text-white hover:border-white/60 hover:bg-white/10',
  emerald: 'bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/15 hover:bg-emerald-900',
}

// Padding menor no mobile: com o respiro do card escuro, "Começar meu
// AUmatch" quebrava em duas linhas numa tela de 390px
const SIZES = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-12 px-5 text-base sm:h-14 sm:px-7',
}

// `action` = { label, to, state?, badge? } — o mesmo formato de
// data/personaActions.js. `to` pode ser uma âncora da home (#simulador)
function ActionLink({ action, variant = 'amber', size = 'lg', icon, showArrow = variant === 'amber', className = '' }) {
  const Icon = icon ?? (variant === 'amber' ? LuSparkles : null)

  return (
    <Link
      to={action.to}
      state={action.state}
      className={`group inline-flex w-full items-center justify-center gap-2.5 rounded-full text-center leading-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:w-auto ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {Icon && (
        <Icon aria-hidden="true" size={17} className="shrink-0 transition-transform duration-300 group-hover:rotate-12" />
      )}
      {action.label}
      {action.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
          {action.badge > 9 ? '9+' : action.badge}
          <span className="sr-only"> {action.badge === 1 ? 'novo' : 'novos'}</span>
        </span>
      )}
      {showArrow && (
        <FaArrowRight aria-hidden="true" size={14} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </Link>
  )
}

export function ActionSkeleton({ className = '' }) {
  return <div aria-hidden="true" className={`h-12 w-56 rounded-full bg-slate-200/70 motion-safe:animate-pulse sm:h-14 ${className}`} />
}

export default ActionLink
