import { useCallback, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  FaCalendarDays,
  FaComments,
  FaEye,
  FaHandHoldingDollar,
  FaHandHoldingHeart,
  FaInbox,
  FaPaw,
  FaPlus,
  FaTableCellsLarge,
} from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import VerifiedBadge from '../components/VerifiedBadge'
import DashboardSections from '../components/dashboard/DashboardSections'
import OngOverviewPanel from '../components/dashboard/OngOverviewPanel'
import OngAnimalsPanel from '../components/dashboard/OngAnimalsPanel'
import OngAdoptionsPanel from '../components/dashboard/OngAdoptionsPanel'
import OngConversationsPanel from '../components/dashboard/OngConversationsPanel'
import OngEventsPanel from '../components/dashboard/OngEventsPanel'
import OngCampaignsPanel from '../components/dashboard/OngCampaignsPanel'
import OngDonationsPanel from '../components/dashboard/OngDonationsPanel'
import { useOngDashboard } from '../hooks/useOngDashboard'

// ?aba=eventos abre direto numa aba (e sobrevive ao F5)
const DASHBOARD_TAB_PARAM = 'aba'

// Painel da ONG: a visão geral resume cada área, e cada área tem a sua aba
function OngDashboardPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { animals, requests, conversations, events, campaigns, donations, timeline, stats, queries } = useOngDashboard()
  // Vem da página do evento/campanha quando a exclusão foi feita por lá
  const [flashMessage, setFlashMessage] = useState(location.state?.flash ?? null)
  const clearFlashMessage = useCallback(() => setFlashMessage(null), [])

  const selectTab = (key) => setSearchParams({ [DASHBOARD_TAB_PARAM]: key }, { replace: true })

  const sections = [
    {
      key: 'visao-geral',
      icon: FaTableCellsLarge,
      tab: 'Visão geral',
      title: 'Visão geral',
      description: 'Os números de cada área e o que aconteceu por último. Escolha um card para ver os detalhes.',
      content: (
        <OngOverviewPanel
          stats={stats}
          timeline={timeline}
          loading={{
            animals: queries.animals.isLoading,
            events: queries.events.isLoading,
            campaigns: queries.campaigns.isLoading,
            donations: queries.donations.isLoading,
          }}
          onSelect={selectTab}
        />
      ),
    },
    {
      key: 'animais',
      icon: FaPaw,
      tab: 'Animais',
      title: 'Animais',
      description:
        'Os disponíveis aparecem na vitrine e no perfil da ONG. "Em processo" já tem uma adoção encaminhada; os adotados ficam como histórico.',
      actions: [{ to: '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }],
      content: (
        <OngAnimalsPanel
          animals={animals}
          isLoading={queries.animals.isLoading}
          error={queries.animals.error}
          onRetry={() => queries.animals.refetch()}
        />
      ),
    },
    {
      key: 'adocoes',
      icon: FaInbox,
      tab: 'Adoções',
      badge: { count: stats.pendingRequests, label: 'pedidos aguardando resposta' },
      title: 'Adoções',
      description:
        'Pedidos recebidos, adoções em andamento e as já concluídas. Para aceitar ou recusar um pedido, abra Interesses recebidos.',
      actions: [{ to: '/interesses-recebidos', label: 'Interesses recebidos' }],
      content: <OngAdoptionsPanel requests={requests} />,
    },
    {
      key: 'conversas',
      icon: FaComments,
      tab: 'Conversas',
      badge: { count: stats.unreadMessages, label: 'mensagens não lidas' },
      title: 'Conversas',
      description: 'Chats com quem quer adotar os animais da ONG, das conversas mais recentes para as mais antigas.',
      actions: [{ to: '/chat', label: 'Abrir chat' }],
      content: <OngConversationsPanel conversations={conversations} />,
    },
    {
      key: 'eventos',
      icon: FaCalendarDays,
      tab: 'Eventos',
      title: 'Eventos',
      description:
        'Os próximos aparecem na vitrine e no perfil da ONG. Veja quem confirmou presença, edite ou cancele. Os já realizados ficam como histórico.',
      actions: [{ to: '/eventos/criar', label: 'Criar evento', icon: FaPlus }],
      content: (
        <OngEventsPanel
          events={events}
          isLoading={queries.events.isLoading}
          error={queries.events.error}
          onRetry={() => queries.events.refetch()}
          onNotify={setFlashMessage}
        />
      ),
    },
    {
      key: 'campanhas',
      icon: FaHandHoldingHeart,
      tab: 'Campanhas',
      title: 'Campanhas',
      description:
        'As ativas aparecem na vitrine e no perfil da ONG e recebem doações por PIX. Edite, encerre antes do prazo ou exclua. As encerradas ficam como histórico.',
      actions: [{ to: '/campanhas/criar', label: 'Criar campanha', icon: FaPlus }],
      content: (
        <OngCampaignsPanel
          campaigns={campaigns}
          isLoading={queries.campaigns.isLoading}
          error={queries.campaigns.error}
          onRetry={() => queries.campaigns.refetch()}
          onNotify={setFlashMessage}
        />
      ),
    },
    {
      key: 'doacoes',
      icon: FaHandHoldingDollar,
      tab: 'Doações',
      title: 'Doações recebidas',
      description: 'Cada PIX confirmado nas campanhas da ONG, com quem doou e para qual campanha.',
      content: (
        <OngDonationsPanel
          donations={donations}
          isLoading={queries.donations.isLoading}
          error={queries.donations.error}
          onRetry={() => queries.donations.refetch()}
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

      <DashboardSections
        sections={sections}
        activeKey={searchParams.get(DASHBOARD_TAB_PARAM)}
        onSelect={selectTab}
      />

      <SuccessToast message={flashMessage} onClose={clearFlashMessage} />
    </div>
  )
}

export default OngDashboardPage
