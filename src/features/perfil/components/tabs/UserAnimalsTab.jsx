import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import { mockUserAnimals, ANIMAL_STATUS_META } from '../../data/mockUserAnimals'

function UserAnimalsTab() {
  if (mockUserAnimals.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">Você ainda não cadastrou nenhum animal.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockUserAnimals.map((animal) => {
        const status = ANIMAL_STATUS_META[animal.status]
        return (
          <Link
            key={animal.id}
            to={`/animais/${animal.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/10"
          >
            <img src={animal.photoUrl} alt={animal.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base font-bold text-emerald-950">{animal.name}</p>
              <p className="truncate text-xs text-slate-500">{animal.breed}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>
                {status.label}
              </span>
            </div>
            <FaArrowRight
              size={13}
              className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-600"
            />
          </Link>
        )
      })}
    </div>
  )
}

export default UserAnimalsTab