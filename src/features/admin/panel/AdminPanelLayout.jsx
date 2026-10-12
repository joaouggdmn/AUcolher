import {
  FaArrowLeft,
  FaCalendarDays,
  FaFlag,
  FaHandHoldingHeart,
  FaPaw,
  FaTableCellsLarge,
  FaUsers,
} from 'react-icons/fa6'
import PanelShell from '../../../core/components/panel/PanelShell'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdminReports } from '../hooks/useAdmin'
import { countPendingCases } from '../utils/reportCases'
import { ADMIN_PATHS } from './adminPaths'

const NAV_GROUPS = [
  {
    items: [{ to: ADMIN_PATHS.overview, end: true, label: 'Visão geral', icon: FaTableCellsLarge }],
  },
  {
    title: 'Moderação',
    items: [
      { to: ADMIN_PATHS.reports, label: 'Denúncias', icon: FaFlag, badge: 'reports', badgeLabel: 'casos pendentes' },
    ],
  },
  {
    title: 'Plataforma',
    items: [
      { to: ADMIN_PATHS.users, label: 'Usuários', icon: FaUsers },
      { to: ADMIN_PATHS.animals, label: 'Animais', icon: FaPaw },
    ],
  },
  {
    title: 'Arrecadação e eventos',
    items: [
      { to: ADMIN_PATHS.campaigns, label: 'Campanhas', icon: FaHandHoldingHeart },
      { to: ADMIN_PATHS.events, label: 'Eventos', icon: FaCalendarDays },
    ],
  },
]

// Painel do admin: mesma moldura do painel da ONG (barra lateral, gaveta no
// celular, toast), com as seções de quem modera a plataforma. O badge de
// Denúncias conta os casos (alvos) esperando uma decisão
function AdminPanelLayout() {
  const { user } = useAuth()
  const { data: reports = [] } = useAdminReports()

  return (
    <PanelShell
      title="Administração"
      nav={{
        homePath: ADMIN_PATHS.overview,
        identity: { name: user?.name, photoUrl: user?.photoUrl, caption: 'Administração' },
        groups: NAV_GROUPS,
        stats: { reports: countPendingCases(reports) },
        footerLinks: [{ to: '/', label: 'Voltar ao site', icon: FaArrowLeft }],
      }}
    />
  )
}

export default AdminPanelLayout
