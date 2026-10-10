import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaCalendarDays, FaEye, FaHandHoldingDollar, FaHandHoldingHeart, FaPlus } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { formatCurrency } from '../../../core/utils/currency'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useMyEvents } from '../../eventos/hooks/useEventos'
import { useMyCampaigns } from '../../doacoes/hooks/useCampanhas'
import { useReceivedDonations } from '../../doacoes/hooks/useDoacoes'
import VerifiedBadge from '../components/VerifiedBadge'
import DashboardSections from '../components/dashboard/DashboardSections'
import OngCampaignsPanel from '../components/dashboard/OngCampaignsPanel'
import OngDonationsPanel from '../components/dashboard/OngDonationsPanel'
import OngEventsPanel from '../components/dashboard/OngEventsPanel'

const NO_DONATIONS = []

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

// Painel da ONG: o que a instituição divulgou, quem vai participar e quanto
// já recebeu. Cada área é uma aba (DashboardSections)
function OngDashboardPage() {
  const location = useLocation()
  const { user } = useAuth()
  const myEventsQuery = useMyEvents()
  const myCampaignsQuery = useMyCampaigns()
  const receivedQuery = useReceivedDonations()
  // Vem da página do evento/campanha quando a exclusão foi feita por lá
  const [flashMessage, setFlashMessage] = useState(location.state?.flash ?? null)
  const clearFlashMessage = useCallback(() => setFlashMessage(null), [])

  const events = useMemo(() => {
    const all = myEventsQuery.data ?? []
    return {
      upcoming: all.filter((event) => !event.isPast).sort(byDateAsc),
      past: all.filter((event) => event.isPast).sort((a, b) => byDateAsc(b, a)),
    }
  }, [myEventsQuery.data])

  // A API já manda da mais nova para a mais antiga
  const campaigns = useMemo(() => {
    const all = myCampaignsQuery.data ?? []
    return {
      active: all.filter((campaign) => !campaign.isClosed),
      closed: all.filter((campaign) => campaign.isClosed),
    }
  }, [myCampaignsQuery.data])

  const donations = receivedQuery.data ?? NO_DONATIONS
  const totalReceived = donations.reduce((sum, donation) => sum + donation.amount, 0)
  const upcomingConfirmed = events.upcoming.reduce((sum, event) => sum + event.confirmedCount, 0)
  const activeRaised = campaigns.active.reduce((sum, campaign) => sum + campaign.raisedAmount, 0)

  const sections = [
    {
      key: 'eventos',
      icon: FaCalendarDays,
      label: events.upcoming.length === 1 ? 'evento agendado' : 'eventos agendados',
      value: myEventsQuery.isLoading ? '—' : events.upcoming.length,
      caption: myEventsQuery.isLoading
        ? 'Carregando...'
        : `${plural(upcomingConfirmed, 'presença confirmada', 'presenças confirmadas')} · ${plural(events.past.length, 'realizado', 'realizados')}`,
      title: 'Eventos',
      description:
        'Os próximos aparecem na vitrine e no perfil da ONG. Veja quem confirmou presença, edite ou cancele. Os já realizados ficam como histórico.',
      actions: [{ to: '/eventos/criar', label: 'Criar evento', icon: FaPlus }],
      content: (
        <OngEventsPanel
          events={events}
          isLoading={myEventsQuery.isLoading}
          error={myEventsQuery.error}
          onRetry={() => myEventsQuery.refetch()}
          onNotify={setFlashMessage}
        />
      ),
    },
    {
      key: 'campanhas',
      icon: FaHandHoldingHeart,
      label: campaigns.active.length === 1 ? 'campanha ativa' : 'campanhas ativas',
      value: myCampaignsQuery.isLoading ? '—' : campaigns.active.length,
      caption: myCampaignsQuery.isLoading
        ? 'Carregando...'
        : `${formatCurrency(activeRaised)} arrecadados · ${plural(campaigns.closed.length, 'encerrada', 'encerradas')}`,
      title: 'Campanhas',
      description:
        'As ativas aparecem na vitrine e no perfil da ONG e recebem doações por PIX. Edite, encerre antes do prazo ou exclua. As encerradas ficam como histórico.',
      actions: [{ to: '/campanhas/criar', label: 'Criar campanha', icon: FaPlus }],
      content: (
        <OngCampaignsPanel
          campaigns={campaigns}
          isLoading={myCampaignsQuery.isLoading}
          error={myCampaignsQuery.error}
          onRetry={() => myCampaignsQuery.refetch()}
          onNotify={setFlashMessage}
        />
      ),
    },
    {
      key: 'doacoes',
      icon: FaHandHoldingDollar,
      label: 'recebidos',
      value: receivedQuery.isLoading ? '—' : formatCurrency(totalReceived),
      caption: receivedQuery.isLoading ? 'Carregando...' : plural(donations.length, 'doação confirmada', 'doações confirmadas'),
      title: 'Doações recebidas',
      description: 'Cada PIX confirmado nas campanhas da ONG, com quem doou e para qual campanha.',
      content: (
        <OngDonationsPanel
          donations={donations}
          isLoading={receivedQuery.isLoading}
          error={receivedQuery.error}
          onRetry={() => receivedQuery.refetch()}
        />
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">Painel da ONG</span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">{user?.name}</h1>
          {user?.isVerified && (
            <div className="mt-2">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>
        <Link
          to={`/ong/${user?.id}`}
          className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50"
        >
          <FaEye size={12} />
          Ver perfil público
        </Link>
      </header>

      <DashboardSections sections={sections} />

      <SuccessToast message={flashMessage} onClose={clearFlashMessage} />
    </div>
  )
}

export default OngDashboardPage
