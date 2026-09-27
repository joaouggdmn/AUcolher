import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaCalendarDays, FaEye, FaPlus } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useMyEvents } from '../../eventos/hooks/useEventos'
import VerifiedBadge from '../components/VerifiedBadge'
import DashboardSections from '../components/dashboard/DashboardSections'
import OngEventsPanel from '../components/dashboard/OngEventsPanel'

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

// Painel da ONG: o que a instituição divulgou e quem vai participar.
// Cada área é uma aba (DashboardSections); campanhas e doações recebidas
// entram na próxima etapa como novas abas
function OngDashboardPage() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: myEvents, isLoading, error, refetch } = useMyEvents()
  // Vem da página do evento quando a exclusão foi feita por lá
  const [flashMessage, setFlashMessage] = useState(location.state?.flash ?? null)
  const clearFlashMessage = useCallback(() => setFlashMessage(null), [])

  const events = useMemo(() => {
    const all = myEvents ?? []
    return {
      upcoming: all.filter((event) => !event.isPast).sort(byDateAsc),
      past: all.filter((event) => event.isPast).sort((a, b) => byDateAsc(b, a)),
    }
  }, [myEvents])

  const upcomingConfirmed = events.upcoming.reduce((sum, event) => sum + event.confirmedCount, 0)

  const sections = [
    {
      key: 'eventos',
      icon: FaCalendarDays,
      label: events.upcoming.length === 1 ? 'evento agendado' : 'eventos agendados',
      value: isLoading ? '—' : events.upcoming.length,
      caption: isLoading
        ? 'Carregando...'
        : `${plural(upcomingConfirmed, 'presença confirmada', 'presenças confirmadas')} · ${plural(events.past.length, 'realizado', 'realizados')}`,
      title: 'Eventos',
      description:
        'Os próximos aparecem na vitrine e no perfil da ONG. Veja quem confirmou presença, edite ou cancele. Os já realizados ficam como histórico.',
      actions: [{ to: '/eventos/criar', label: 'Criar evento', icon: FaPlus }],
      content: (
        <OngEventsPanel
          events={events}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          onNotify={setFlashMessage}
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
