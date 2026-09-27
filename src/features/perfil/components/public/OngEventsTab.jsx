import { Link } from 'react-router-dom'
import { FaCalendarDays, FaPlus } from 'react-icons/fa6'
import EventCard from '../../../eventos/components/EventCard'
import EventCardSkeleton from '../../../eventos/components/EventCardSkeleton'

const SKELETON_COUNT = 3

// Aba "Eventos" do perfil público da ONG: só os próximos, como na vitrine.
// Quem vê o próprio perfil ganha o atalho para divulgar um evento
function OngEventsTab({ events, isLoading, isError, ongName, isOwnProfile }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError || events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaCalendarDays size={18} />
        </span>
        <p className="text-sm font-semibold text-slate-600">
          {isError
            ? 'Não foi possível carregar os eventos agora. Tente novamente em instantes.'
            : `${ongName} não tem eventos agendados no momento.`}
        </p>
        {isOwnProfile && !isError && (
          <Link
            to="/eventos/criar"
            className="mt-3 flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            <FaPlus size={12} />
            Criar evento
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} layout="grid" />
      ))}
    </div>
  )
}

export default OngEventsTab
