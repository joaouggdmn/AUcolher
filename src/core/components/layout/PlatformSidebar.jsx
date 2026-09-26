import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { FaHeart, FaPaw, FaInbox, FaComments } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'

// Links principais só aparecem aqui no mobile — no desktop eles já estão
// centralizados na navbar
const NAV_LINKS = [
  { label: 'Início', to: '/', end: true },
  { label: 'AUmatch', to: '/aumatch', isPremium: true },
  { label: 'Animais', to: '/animais', end: true },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Campanhas', to: '/campanhas' },
]

function formatBadge(count) {
  return count > 9 ? '9+' : count
}

// Ações do dia a dia na plataforma. O menu do avatar ficou só com o que é
// da conta em si (perfil e sair).
function PlatformSidebar({ isOpen, onClose, totalFavoritos, pendingCount, unreadChatCount }) {
  const closeButtonRef = useRef(null)

  const shortcuts = [
    {
      label: 'Meus favoritos',
      to: '/favoritos',
      icon: FaHeart,
      iconClass: 'text-rose-500',
      // Favoritos não são "novidade" — contador neutro, fora do badge do botão
      count: totalFavoritos,
      countVariant: 'neutral',
    },
    { label: 'Cadastrar animal', to: '/animais/criar', icon: FaPaw, iconClass: 'text-emerald-600' },
    {
      label: 'Interesses recebidos',
      to: '/interesses-recebidos',
      icon: FaInbox,
      iconClass: 'text-emerald-600',
      count: pendingCount,
      countLabel: (n) => `${n} ${n === 1 ? 'pendente' : 'pendentes'}`,
    },
    {
      label: 'Chat',
      to: '/chat',
      icon: FaComments,
      iconClass: 'text-emerald-600',
      count: unreadChatCount,
      countLabel: (n) => `${n} ${n === 1 ? 'mensagem não lida' : 'mensagens não lidas'}`,
    },
  ]

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`} inert={!isOpen}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Meu espaço"
        className={`absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-3rem))] flex-col bg-white shadow-2xl shadow-emerald-950/20 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link to="/" onClick={onClose} className="text-xl font-black tracking-tight">
            <span className="text-emerald-900">AU</span>
            <span className="text-amber-500">colher</span>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Meu espaço</p>
          <ul className="flex flex-col gap-0.5">
            {shortcuts.map(({ label, to, icon: Icon, iconClass, count, countVariant, countLabel }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  onClick={onClose}
                  aria-label={count > 0 && countLabel ? `${label} — ${countLabel(count)}` : undefined}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={15} className={iconClass} />
                    {label}
                  </span>

                  {count > 0 && (
                    <span
                      aria-hidden="true"
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                        countVariant === 'neutral' ? 'bg-rose-50 text-rose-600' : 'bg-red-500 text-white'
                      }`}
                    >
                      {countVariant === 'neutral' ? count : formatBadge(count)}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="md:hidden">
            <p className="mt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Navegar</p>
            <ul className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      link.isPremium
                        ? 'my-1 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-extrabold text-emerald-950 shadow-sm'
                        : `block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                            isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                          }`
                    }
                  >
                    {link.isPremium && <LuSparkles size={16} />}
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </div>
  )
}

export default PlatformSidebar
