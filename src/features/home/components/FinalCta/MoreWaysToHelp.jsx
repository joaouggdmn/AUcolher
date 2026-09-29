import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaHandHoldingHeart } from 'react-icons/fa6'

const WAYS = [
  {
    to: '/eventos',
    icon: FaCalendarDays,
    title: 'Feiras e eventos',
    description: 'Conheça os animais pessoalmente em feiras e mutirões das ONGs.',
  },
  {
    to: '/campanhas',
    icon: FaHandHoldingHeart,
    title: 'Campanhas',
    description: 'Ajude ONGs com tratamentos, ração e estrutura.',
  },
]

// Só atalhos para as páginas reais: nada de prévia com evento ou campanha
// de mock, que envelhece (e passa a mostrar datas vencidas) sem ninguém ver
function MoreWaysToHelp({ className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">Outras formas de ajudar</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {WAYS.map(({ to, icon: Icon, title, description }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex h-full items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/5 hover:ring-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon aria-hidden="true" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-extrabold tracking-tight text-emerald-950">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">{description}</span>
              </span>
              <FaArrowRight
                aria-hidden="true"
                size={14}
                className="shrink-0 text-emerald-700 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MoreWaysToHelp
