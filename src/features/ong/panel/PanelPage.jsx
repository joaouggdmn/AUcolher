import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

// Moldura de cada seção do painel: título, descrição e botões no topo.
// `framed` põe o conteúdo num cartão branco; a visão geral monta os próprios
function PanelPage({ title, description, actions, framed = true, children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>

        {actions?.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {actions.map(({ to, label, icon: ActionIcon = FaArrowRight }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
              >
                <ActionIcon size={11} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {framed ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">{children}</div>
      ) : (
        children
      )}
    </div>
  )
}

export default PanelPage
