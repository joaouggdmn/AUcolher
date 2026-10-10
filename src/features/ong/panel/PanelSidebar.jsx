import { Link, NavLink } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import {
  FaArrowLeft,
  FaCalendarDays,
  FaComments,
  FaEye,
  FaHandHoldingDollar,
  FaHandHoldingHeart,
  FaInbox,
  FaPaw,
  FaTableCellsLarge,
} from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import VerifiedBadge from '../components/VerifiedBadge'
import { PANEL_PATHS } from './panelPaths'

// `badge` aponta para um número de stats (useOngDashboard): o que espera a ONG
const NAV_GROUPS = [
  {
    items: [{ to: PANEL_PATHS.overview, end: true, label: 'Visão geral', icon: FaTableCellsLarge }],
  },
  {
    title: 'Adoção',
    items: [
      { to: PANEL_PATHS.animals, label: 'Animais', icon: FaPaw },
      { to: PANEL_PATHS.requests, label: 'Pedidos', icon: FaInbox, badge: 'pendingRequests', badgeLabel: 'aguardando resposta' },
      { to: PANEL_PATHS.chats, label: 'Conversas', icon: FaComments, badge: 'unreadMessages', badgeLabel: 'mensagens não lidas' },
    ],
  },
  {
    title: 'Arrecadação e eventos',
    items: [
      { to: PANEL_PATHS.events, label: 'Eventos', icon: FaCalendarDays },
      { to: PANEL_PATHS.campaigns, label: 'Campanhas', icon: FaHandHoldingHeart },
      { to: PANEL_PATHS.donations, label: 'Doações', icon: FaHandHoldingDollar },
    ],
  },
]

const FOOTER_LINK_CLASSES =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-100/80 transition-colors duration-200 hover:bg-white/5 hover:text-white'

function formatBadge(count) {
  return count > 9 ? '9+' : count
}

function OngAvatar({ user }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-base font-black text-amber-300">
      {user?.photoUrl ? (
        <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        user?.name?.charAt(0).toUpperCase()
      )}
    </span>
  )
}

// Conteúdo da barra lateral, igual no desktop (fixa) e no celular (gaveta).
// Na gaveta chegam `onClose` (mostra o X) e `onNavigate` (fecha ao trocar de seção)
function PanelSidebar({ stats, onClose, onNavigate, closeButtonRef }) {
  const { user } = useAuth()

  return (
    <div className="flex h-full w-full flex-col bg-emerald-950 text-emerald-100">
      <div className="flex items-center justify-between px-5 pt-5">
        <Link to={PANEL_PATHS.overview} onClick={onNavigate} className="text-xl font-black tracking-tight">
          <span className="text-white">AU</span>
          <span className="text-amber-400">colher</span>
        </Link>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-200 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="mx-3 mt-5 flex flex-col gap-3 rounded-2xl bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <OngAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white" title={user?.name}>
              {user?.name}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">Painel da ONG</p>
          </div>
        </div>
        {user?.isVerified && <VerifiedBadge size="sm" />}
      </div>

      <nav aria-label="Seções do painel" className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, index) => (
          <div key={group.title ?? index} className={index > 0 ? 'mt-5' : ''}>
            {group.title && (
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">{group.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ to, end, label, icon: Icon, badge, badgeLabel }) => {
                const count = badge ? stats[badge] : 0
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                          isActive ? 'bg-white/10 text-white' : 'text-emerald-100/80 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={15} className={isActive ? 'text-amber-300' : 'text-emerald-300/70'} />
                          <span className="flex-1">{label}</span>
                          {count > 0 && (
                            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                              {formatBadge(count)}
                              <span className="sr-only"> {badgeLabel}</span>
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-white/10 p-3">
        <Link to={`/ong/${user?.id}`} onClick={onNavigate} className={FOOTER_LINK_CLASSES}>
          <FaEye size={14} className="text-emerald-300/70" />
          Ver perfil público
        </Link>
        <Link to="/" className={FOOTER_LINK_CLASSES}>
          <FaArrowLeft size={14} className="text-emerald-300/70" />
          Voltar ao site
        </Link>
      </div>
    </div>
  )
}

export default PanelSidebar
