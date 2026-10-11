import {
  FaArrowLeft,
  FaBuildingNgo,
  FaCalendarDays,
  FaComments,
  FaEye,
  FaHandHoldingDollar,
  FaHandHoldingHeart,
  FaInbox,
  FaPaw,
  FaStar,
  FaTableCellsLarge,
} from 'react-icons/fa6'
import PanelShell from '../../../core/components/panel/PanelShell'
import { useAuth } from '../../../core/context/AuthContext'
import { useOngDashboard } from '../hooks/useOngDashboard'
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
  {
    title: 'Instituição',
    items: [
      { to: PANEL_PATHS.reviews, label: 'Avaliações', icon: FaStar },
      { to: PANEL_PATHS.profile, label: 'Perfil da ONG', icon: FaBuildingNgo },
    ],
  },
]

// Painel da ONG: a moldura (barra lateral, gaveta, toast) é a mesma do painel
// do admin. Os dados vêm de uma vez só e chegam às páginas por useOngPanel()
function OngPanelLayout() {
  const { user } = useAuth()
  const dashboard = useOngDashboard()

  return (
    <PanelShell
      title="Painel da ONG"
      context={{ dashboard }}
      nav={{
        homePath: PANEL_PATHS.overview,
        identity: { name: user?.name, photoUrl: user?.photoUrl, isVerified: user?.isVerified, caption: 'Painel da ONG' },
        groups: NAV_GROUPS,
        stats: dashboard.stats,
        footerLinks: [
          { to: `/ong/${user?.id}`, label: 'Ver perfil público', icon: FaEye },
          { to: '/', label: 'Voltar ao site', icon: FaArrowLeft },
        ],
      }}
    />
  )
}

export default OngPanelLayout
