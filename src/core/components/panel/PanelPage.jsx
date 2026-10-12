import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

const ACTION_CLASSES =
  'flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900'

// Moldura de cada seção do painel: título, descrição e botões no topo. Cada
// ação é um link (`to`) ou um botão (`onClick`), e nenhuma sai na impressão.
// `printHeader` troca o topo na impressão (ex.: cabeçalho de relatório).
// `framed` põe o conteúdo num cartão branco; a visão geral monta os próprios
function PanelPage({ title, description, actions, printHeader, framed = true, children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10 print:max-w-none print:p-0">
      {printHeader && <div className="hidden print:block">{printHeader}</div>}
      <header
        className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${printHeader ? 'print:hidden' : ''}`}
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>

        {actions?.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
            {actions.map(({ to, onClick, label, icon: ActionIcon = FaArrowRight }) =>
              to ? (
                <Link key={to} to={to} className={ACTION_CLASSES}>
                  <ActionIcon size={11} />
                  {label}
                </Link>
              ) : (
                <button key={label} type="button" onClick={onClick} className={ACTION_CLASSES}>
                  <ActionIcon size={11} />
                  {label}
                </button>
              )
            )}
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
