import { useOutletContext } from 'react-router-dom'

// O que o AdminPanelLayout entrega para as páginas do painel: os dados da
// plataforma (buscados uma vez só) e `notify`, que mostra um aviso de sucesso
export function useAdminPanel() {
  return useOutletContext()
}
