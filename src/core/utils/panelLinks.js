import { FaBuildingNgo, FaShieldHalved } from 'react-icons/fa6'
import { PANEL_PATHS } from '../../features/ong/panel/panelPaths'
import { ADMIN_PATHS } from '../../features/admin/panel/adminPaths'

// Atalho para o painel próprio de cada papel (tela sem a navbar do site),
// usado na navbar, no menu do avatar e no menu lateral. Pessoa não tem painel
export function getPanelLink(userType) {
  if (userType === 'ONG') return { label: 'Painel da ONG', to: PANEL_PATHS.overview, icon: FaBuildingNgo }
  if (userType === 'ADMIN') return { label: 'Painel do admin', to: ADMIN_PATHS.overview, icon: FaShieldHalved }
  return null
}

// Para onde vai quem acabou de entrar sem uma página de origem: o admin cai
// direto no painel dele; pessoa e ONG, no início do site
export function getHomePath(userType) {
  return userType === 'ADMIN' ? ADMIN_PATHS.overview : '/'
}
