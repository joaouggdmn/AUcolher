import {
  FaArrowLeft,
  FaCalendarDays,
  FaHandHoldingHeart,
  FaPaw,
  FaTableCellsLarge,
  FaUsers,
} from 'react-icons/fa6'
import PanelShell from '../../../core/components/panel/PanelShell'
import { useAuth } from '../../../core/context/AuthContext'
import { ADMIN_PATHS } from './adminPaths'

const NAV_GROUPS = [
  {
    items: [{ to: ADMIN_PATHS.overview, end: true, label: 'Visão geral', icon: FaTableCellsLarge }],
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
// celular, toast), com as seções de quem modera a plataforma
function AdminPanelLayout() {
  const { user } = useAuth()

  return (
    <PanelShell
      title="Administração"
      nav={{
        homePath: ADMIN_PATHS.overview,
        identity: { name: user?.name, photoUrl: user?.photoUrl, caption: 'Administração' },
        groups: NAV_GROUPS,
        footerLinks: [{ to: '/', label: 'Voltar ao site', icon: FaArrowLeft }],
      }}
    />
  )
}

export default AdminPanelLayout
