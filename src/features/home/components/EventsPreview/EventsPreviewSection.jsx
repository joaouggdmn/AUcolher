import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import EventCard from '../../../eventos/components/EventCard'
import { mockEventos } from '../../../eventos/data/mockEventos'
import RevealOnScroll from '../../../../core/components/ui/RevealOnScroll'

function EventsPreviewSection() {
  const upcomingEvents = mockEventos.slice(0, 3)

  return (
    <section className="relative overflow-hidden bg-emerald-950 px-4 py-20 sm:px-6 lg:py-28">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <RevealOnScroll className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-400">Acontecendo agora</span>
            <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">
              Feiras e mutirões de adoção
            </h2>
            <p className="mt-3 max-w-lg text-emerald-100/70">
              Eventos organizados por ONGs verificadas perto de você — confirme presença em poucos cliques.
            </p>
          </div>

          <Link
            to="/eventos"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
          >
            Ver todos os eventos
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event, index) => (
            <RevealOnScroll key={event.id} delay={index * 120}>
              <EventCard event={event} layout="grid" />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EventsPreviewSection