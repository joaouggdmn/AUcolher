import { useOutletContext } from 'react-router-dom'

// O que o OngPanelLayout entrega para as páginas do painel: os dados de
// useOngDashboard (calculados uma vez só, também usados pelos contadores da
// barra lateral) e `notify`, que mostra um aviso de sucesso
export function useOngPanel() {
  return useOutletContext()
}
