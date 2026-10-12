import { Link } from 'react-router-dom'
import { FaArrowRight, FaFlag } from 'react-icons/fa6'
import { ADMIN_PATHS } from '../panel/adminPaths'

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

// Atalho da Visão geral para julgar (regras §9.1). Só aparece quando há
// casos pendentes; na impressão, vira uma linha do relatório
function PendingReportsNotice({ reports }) {
  const { pending, pendingTargets } = reports
  if (pendingTargets === 0) return null

  return (
    <Link
      to={ADMIN_PATHS.reports}
      className="group flex break-inside-avoid items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 transition-all duration-300 hover:border-rose-200 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
        <FaFlag size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-rose-900">
          {pendingTargets} {plural(pendingTargets, 'caso de denúncia aguardando', 'casos de denúncia aguardando')} análise
        </span>
        <span className="block text-xs text-rose-700">
          {pending} {plural(pending, 'denúncia pendente', 'denúncias pendentes')} de anúncios e perfis
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-rose-700 print:hidden">
        Julgar
        <FaArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default PendingReportsNotice
