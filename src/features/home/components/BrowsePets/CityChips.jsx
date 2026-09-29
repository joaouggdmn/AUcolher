import { Link } from 'react-router-dom'

const MAX_CITIES = 6

// Mesmo contrato da busca do hero: a listagem filtra a cidade pelo ?search=
function CityChips({ cities, className = '' }) {
  if (cities.length === 0) return null

  return (
    <nav aria-label="Buscar por cidade" className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="mr-1 text-sm font-semibold text-slate-500">
        Buscar por cidade:
      </span>
      {cities.slice(0, MAX_CITIES).map(({ name, count }) => (
        <Link
          key={name}
          to={`/animais?search=${encodeURIComponent(name)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100 transition-colors duration-300 hover:bg-emerald-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          {name}
          <span className="text-xs font-bold tabular-nums opacity-60">
            {count}
            <span className="sr-only"> {count === 1 ? 'pet' : 'pets'}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default CityChips
