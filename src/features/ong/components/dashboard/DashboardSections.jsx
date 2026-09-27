import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

// Quantidade de abas → colunas (classes do Tailwind precisam aparecer inteiras no código)
const GRID_COLUMNS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }

// Mesmo padrão de "Atividade na AUcolher" (Minha conta): cada card resume uma
// área e, clicado, abre a lista dela logo abaixo. As áreas chegam por
// `sections`, então campanhas e doações entram só acrescentando itens
function DashboardSections({ sections }) {
  const [activeKey, setActiveKey] = useState(sections[0].key)
  const activeSection = sections.find((section) => section.key === activeKey) ?? sections[0]

  return (
    <section aria-label="Áreas do painel">
      <div role="tablist" className={`grid grid-cols-1 gap-3 ${GRID_COLUMNS[sections.length] ?? 'sm:grid-cols-3'}`}>
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = section.key === activeSection.key

          return (
            <button
              key={section.key}
              id={`dashboard-tab-${section.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="dashboard-panel"
              onClick={() => setActiveKey(section.key)}
              className={`flex items-center gap-4 rounded-2xl p-5 text-left transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20'
                  : 'border border-slate-100 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isActive ? 'bg-white/15 text-amber-300' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black tracking-tight ${isActive ? 'text-white' : 'text-emerald-950'}`}>
                    {section.value}
                  </span>
                  <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-emerald-950'}`}>{section.label}</span>
                </span>
                <span className={`block truncate text-xs ${isActive ? 'text-emerald-100/80' : 'text-slate-500'}`}>
                  {section.caption}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* key força remontagem a cada troca, disparando a animação de entrada */}
      <div
        key={activeSection.key}
        id="dashboard-panel"
        role="tabpanel"
        aria-labelledby={`dashboard-tab-${activeSection.key}`}
        className="mt-4 animate-fade-slide-in rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">{activeSection.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{activeSection.description}</p>
          </div>

          {activeSection.actions && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {activeSection.actions.map(({ to, label, icon: ActionIcon = FaArrowRight }) => (
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
        </div>

        {activeSection.content}
      </div>
    </section>
  )
}

export default DashboardSections
