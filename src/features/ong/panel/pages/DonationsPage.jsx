import OngDonationsPanel from '../../components/dashboard/OngDonationsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function DonationsPage() {
  const { dashboard } = useOngPanel()
  const { donations, queries } = dashboard

  return (
    <PanelPage
      title="Doações recebidas"
      description="Cada PIX confirmado nas campanhas da ONG, com quem doou e para qual campanha."
    >
      <OngDonationsPanel
        donations={donations}
        isLoading={queries.donations.isLoading}
        error={queries.donations.error}
        onRetry={() => queries.donations.refetch()}
      />
    </PanelPage>
  )
}

export default DonationsPage
