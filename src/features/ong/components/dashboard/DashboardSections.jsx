import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

function formatBadge(count) {
  return count > 9 ? '9+' : count
}

// Abas do painel numa barra só; no celular ela rola para o lado. A aba ativa
// vem de fora (fica na URL), e `badge` marca o que espera uma ação da ONG
function DashboardSections({ sections, activeKey, onSelect }) {
  const activeSection = sections.find((section) => section.key === activeKey) ?? sections[0]
  const activeTabRef = useRef(null)

  // Aba escolhida por um card da visão geral pode estar fora da área visível da barra
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeSection.key])

  return (
    <section aria-label="Áreas do painel">
      <div
        role="tablist"
        aria-label="Áreas do painel"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm [scrollbar-width:none]"
      >
        {sections.map(({ key, icon: Icon, tab, badge }) => {
          const isActive = key === activeSection.key

          return (
            <button
              key={key}
              ref={isActive ? activeTabRef : null}
              id={`dashboard-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="dashboard-panel"
              onClick={() => onSelect(key)}
              className={`flex shrink-0 scroll-mt-28 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-amber-300' : 'text-emerald-600'} />
              {tab}
              {badge?.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                    isActive ? 'bg-amber-300 text-emerald-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {formatBadge(badge.count)}
                  <span className="sr-only"> {badge.label}</span>
                </span>
              )}
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
