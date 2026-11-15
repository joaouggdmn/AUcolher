import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa6'
import PanelPage from '../../../../core/components/panel/PanelPage'
import MercadoPagoCard from '../../components/dashboard/MercadoPagoCard'
import OngCampaignsPanel from '../../components/dashboard/OngCampaignsPanel'
import { useOngPanel } from '../useOngPanel'
import { PANEL_PATHS } from '../panelPaths'

// Volta da autorização no Mercado Pago: a API redireciona para esta página
// com ?mp= (connected, denied, already_linked ou error)
const MP_RETURN_ERRORS = {
  denied: 'A conexão com o Mercado Pago foi cancelada.',
  already_linked: 'Esta conta do Mercado Pago já está vinculada a outra ONG.',
  error: 'Não foi possível conectar a conta do Mercado Pago. Tente de novo.',
}

function CampaignsPage() {
  const { dashboard, notify } = useOngPanel()
  const { campaigns, queries } = dashboard
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Lido uma vez só: a URL é limpa logo abaixo, para recarregar não repetir o aviso
  const [mpReturn] = useState(() => searchParams.get('mp'))
  const mpFeedback = mpReturn && mpReturn !== 'connected' ? (MP_RETURN_ERRORS[mpReturn] ?? MP_RETURN_ERRORS.error) : null

  useEffect(() => {
    if (!mpReturn) return
    if (mpReturn === 'connected') notify('Conta do Mercado Pago conectada.')
    navigate(pathname, { replace: true })
  }, [mpReturn, notify, navigate, pathname])

  return (
    <PanelPage
      title="Campanhas"
      description="As ativas aparecem na vitrine e no perfil da ONG e recebem doações por PIX. Edite, encerre antes do prazo ou exclua. As encerradas ficam como histórico."
      actions={[{ to: PANEL_PATHS.campaignNew, label: 'Criar campanha', icon: FaPlus }]}
    >
      <MercadoPagoCard feedback={mpFeedback} onNotify={notify} className="mb-6" />
      <OngCampaignsPanel
        campaigns={campaigns}
        isLoading={queries.campaigns.isLoading}
        error={queries.campaigns.error}
        onRetry={() => queries.campaigns.refetch()}
        onNotify={notify}
      />
    </PanelPage>
  )
}

export default CampaignsPage
