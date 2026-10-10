import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useOngDashboard } from '../hooks/useOngDashboard'
import PanelSidebar from './PanelSidebar'
import { PANEL_PATHS } from './panelPaths'

// Tela própria do painel, como o chat: sem a navbar do site. A barra lateral
// fica fixa no desktop; no celular vira uma gaveta aberta pelo botão de menu
function OngPanelLayout() {
  const location = useLocation()
  const dashboard = useOngDashboard()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [dismissedFlashKey, setDismissedFlashKey] = useState(null)
  const mainRef = useRef(null)
  const closeButtonRef = useRef(null)

  // Aviso de uma ação no painel (`notify`) ou vindo de outra página na
  // navegação (ex.: evento excluído na página dele)
  const flash = location.state?.flash && dismissedFlashKey !== location.key ? location.state.flash : null
  const closeToast = useCallback(() => {
    setNotice(null)
    setDismissedFlashKey(location.key)
  }, [location.key])

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  // A área de conteúdo tem rolagem própria: volta ao topo a cada seção
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!isDrawerOpen) return
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 lg:flex">
        <PanelSidebar stats={dashboard.stats} />
      </aside>

      <div className={`fixed inset-0 z-[60] lg:hidden ${isDrawerOpen ? '' : 'pointer-events-none'}`} inert={!isDrawerOpen}>
        <div
          aria-hidden="true"
          onClick={closeDrawer}
          className={`absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu do painel"
          className={`absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-3rem))] shadow-2xl shadow-emerald-950/30 transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <PanelSidebar
            stats={dashboard.stats}
            onClose={closeDrawer}
            onNavigate={closeDrawer}
            closeButtonRef={closeButtonRef}
          />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-label="Abrir menu do painel"
            className="flex h-10 w-10 items-center justify-center rounded-full text-emerald-900 transition-colors duration-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <FiMenu size={21} />
          </button>
          <Link to={PANEL_PATHS.overview} className="text-lg font-black tracking-tight">
            <span className="text-emerald-950">AU</span>
            <span className="text-amber-500">colher</span>
          </Link>
          <span className="text-sm font-semibold text-slate-400">Painel da ONG</span>
        </header>

        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
          {/* key força remontagem a cada seção, disparando a animação de entrada.
              Só opacidade: um transform aqui prenderia os modais `fixed` das páginas */}
          <div key={location.pathname} className="animate-fade-in">
            <Outlet context={{ dashboard, notify: setNotice }} />
          </div>
        </main>
      </div>

      <SuccessToast message={notice ?? flash} onClose={closeToast} />
    </div>
  )
}

export default OngPanelLayout
