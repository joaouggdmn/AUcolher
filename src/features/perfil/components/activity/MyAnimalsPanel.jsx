import { Link } from 'react-router-dom'
import { FaArrowRight, FaPaw, FaPlus, FaHeart } from 'react-icons/fa6'
import ActivityEmptyState from './ActivityEmptyState'

const LISTING_STATUS_META = {
  DISPONIVEL: { label: 'Disponível', className: 'bg-emerald-50 text-emerald-700' },
  EM_PROCESSO: { label: 'Em processo', className: 'bg-amber-50 text-amber-700' },
  ADOTADO: { label: 'Adotado', className: 'bg-slate-100 text-slate-500' },
}

function MyAnimalsPanel({ animals }) {
  if (animals.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaPaw}
        title="Você ainda não cadastrou nenhum animal."
        description="Os animais que você anunciar aparecem aqui e, enquanto estiverem disponíveis, no seu perfil público."
        action={{ to: '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {animals.map((animal) => {
        const status = LISTING_STATUS_META[animal.listingStatus]
        return (
          <Link
            key={animal.id}
            to={`/animais/${animal.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/10"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-600">
              {animal.photoUrl ? (
                <img src={animal.photoUrl} alt={animal.name} className="h-full w-full object-cover" />
              ) : (
                <FaPaw size={18} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{animal.name}</p>
              <p className="truncate text-xs text-slate-500">{animal.breed}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                {animal.pendingInterests > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                    <FaHeart size={9} />
                    {animal.pendingInterests} {animal.pendingInterests === 1 ? 'interesse' : 'interesses'}
                  </span>
                )}
              </div>
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

export default MyAnimalsPanel
