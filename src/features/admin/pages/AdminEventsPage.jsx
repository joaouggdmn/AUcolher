import { useState } from 'react'
import { FaCalendarCheck, FaCalendarDays, FaCalendarXmark, FaTrashCan, FaUserGroup } from 'react-icons/fa6'
import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import PanelPage from '../../../core/components/panel/PanelPage'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import StatTile from '../../../core/components/panel/StatTile'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import Spinner from '../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import { getErrorMessage } from '../../../core/utils/apiError'
import { matchesSearch } from '../../../core/utils/search'
import SearchBar from '../../animais/components/SearchBar'
import { CATEGORIA_OPTIONS } from '../../eventos/components/filters/filterOptions'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'
import AdminEventRow from '../components/AdminEventRow'
import { useAdminEvents, useRemoveEvent } from '../hooks/useAdmin'
import { useAdminPanel } from '../panel/useAdminPanel'
import { removeEventDescription } from '../utils/moderationText'
import { EVENT_STATUS_META, eventStatus } from '../utils/listStatus'

const PAGE_SIZE = 20
const NO_EVENTS = []

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

// Próximos do mais perto para o mais longe; os demais, do mais recente para trás
function byDate(statusFilter) {
  return (a, b) => {
    const order = `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
    return statusFilter === 'UPCOMING' ? order : -order
  }
}

function AdminEventsPage() {
  const { data: events = NO_EVENTS, isLoading, error, refetch } = useAdminEvents()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const { notify } = useAdminPanel()
  const removeEvent = useRemoveEvent()
  // Evento esperando a confirmação da remoção
  const [removing, setRemoving] = useState(null)

  function askRemoval(event) {
    removeEvent.reset()
    setRemoving(event)
  }

  function handleRemove() {
    removeEvent.mutate(removing, {
      onSuccess: () => {
        setRemoving(null)
        notify('Evento removido.')
      },
    })
  }

  // Filtro novo, lista do começo
  function withReset(setter) {
    return (value) => {
      setter(value)
      setVisibleCount(PAGE_SIZE)
    }
  }

  let content
  if (isLoading) {
    content = <Spinner />
  } else if (error) {
    content = <LoadErrorState title="Não foi possível carregar os eventos" message={getErrorMessage(error)} onRetry={refetch} />
  } else if (events.length === 0) {
    content = (
      <ActivityEmptyState
        icon={FaCalendarDays}
        title="Nenhum evento ainda."
        description="Feiras de adoção, mutirões e bazares que as ONGs publicarem aparecem aqui."
      />
    )
  } else {
    const countByStatus = (status) => events.filter((event) => eventStatus(event) === status).length
    const upcoming = events.filter((event) => eventStatus(event) === 'UPCOMING')
    const upcomingConfirmed = upcoming.reduce((total, event) => total + event.confirmedCount, 0)

    const byCategory = CATEGORIA_OPTIONS.map(({ value, label }) => ({
      key: value,
      label,
      value: events.filter((event) => event.category === value && eventStatus(event) !== 'CANCELLED').length,
      colorClass: 'bg-emerald-600',
    }))

    const statusOptions = [
      { value: '', label: `Todos (${events.length})` },
      ...Object.entries(EVENT_STATUS_META)
        .map(([status, meta]) => ({ value: status, count: countByStatus(status), label: meta.filterLabel }))
        .filter((option) => option.count > 0)
        .map(({ value, count, label }) => ({ value, label: `${label} (${count})` })),
    ]

    const filtered = events
      .filter((event) => !statusFilter || eventStatus(event) === statusFilter)
      .filter((event) => matchesSearch(search, event.title, event.organizer.name, event.location.city))
      .sort(byDate(statusFilter))
    const visible = filtered.slice(0, visibleCount)

    content = (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={FaCalendarDays}
              value={upcoming.length}
              label={plural(upcoming.length, 'evento agendado', 'eventos agendados')}
              caption="De hoje em diante"
            />
            <StatTile
              icon={FaUserGroup}
              value={upcomingConfirmed}
              label={plural(upcomingConfirmed, 'presença confirmada', 'presenças confirmadas')}
              caption="Nos eventos agendados"
            />
            <StatTile
              icon={FaCalendarCheck}
              value={countByStatus('PAST')}
              label={plural(countByStatus('PAST'), 'já aconteceu', 'já aconteceram')}
              caption="Ficam como histórico"
            />
            <StatTile
              icon={FaCalendarXmark}
              value={countByStatus('CANCELLED')}
              label={plural(countByStatus('CANCELLED'), 'cancelado', 'cancelados')}
              caption="Tinham pessoas confirmadas"
            />
          </div>
          <ChartCard title="Por categoria" subtitle="Eventos agendados e que já aconteceram">
            <BarList items={byCategory} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <SearchBar
            value={search}
            onChange={withReset(setSearch)}
            placeholder="Buscar pelo título, pela ONG ou pela cidade..."
          />
          <PillToggleGroup options={statusOptions} value={statusFilter} onChange={withReset(setStatusFilter)} />

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhum evento encontrado com esses filtros.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {visible.map((event) => (
                  <AdminEventRow key={event.id} event={event} onRemove={askRemoval} />
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <ShowMoreButton
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  remainingCount={filtered.length - visibleCount}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <PanelPage title="Eventos" description="Eventos de todas as ONGs: os agendados, os que já aconteceram e os cancelados.">
      {content}

      {removing && (
        <ConfirmDialog
          icon={FaTrashCan}
          variant="danger"
          title="Remover o evento?"
          description={removeEventDescription(removing.title, removing.confirmedCount)}
          confirmLabel="Remover"
          processingLabel="Removendo..."
          isProcessing={removeEvent.isPending}
          error={removeEvent.isError ? getErrorMessage(removeEvent.error) : null}
          onConfirm={handleRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </PanelPage>
  )
}

export default AdminEventsPage
