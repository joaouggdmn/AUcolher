import { Link } from 'react-router-dom'
import { FaCircleCheck, FaEye, FaEyeSlash, FaHeart, FaPaw, FaPen } from 'react-icons/fa6'
import { SPECIES_OPTIONS } from '../../../animais/components/filters/filterOptions'
import { LISTING_STATUS_META } from '../../../animais/utils/listingStatus'
import { PANEL_PATHS } from '../panelPaths'

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300 disabled:cursor-wait disabled:opacity-60'

function speciesLabel(species) {
  return SPECIES_OPTIONS.find((option) => option.value === species)?.label ?? 'Animal'
}

function Spinner() {
  return <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
}

// Uma linha da lista de animais do painel. As ações seguem o status na API:
// adotado é definitivo (só dá para ver); fora do ar pode voltar
function AnimalRow({ animal, pendingStatus, onChangeStatus, onMarkAdopted }) {
  const status = LISTING_STATUS_META[animal.listingStatus]
  const isBusy = pendingStatus != null
  const adoptedWord = animal.sex === 'FEMALE' ? 'adotada' : 'adotado'

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-600">
          {animal.photoUrl ? (
            <img src={animal.photoUrl} alt={animal.name} className="h-full w-full object-cover" />
          ) : (
            <FaPaw size={18} />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{animal.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {[speciesLabel(animal.species), animal.breed, animal.ageLabel].filter(Boolean).join(' · ')}
          </p>
          {animal.pendingInterests > 0 && (
            <Link
              to={PANEL_PATHS.requests}
              className="mt-1 flex w-fit items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline"
            >
              <FaHeart size={9} />
              {animal.pendingInterests} {animal.pendingInterests === 1 ? 'pedido aguardando resposta' : 'pedidos aguardando resposta'}
            </Link>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {animal.status !== 'ADOPTED' && (
          <Link
            to={PANEL_PATHS.animalEdit(animal.id)}
            className={`${ACTION_CLASSES} border-slate-200 text-slate-600 hover:bg-slate-50`}
          >
            <FaPen size={10} />
            Editar
          </Link>
        )}

        {animal.status === 'AVAILABLE' && (
          <button
            type="button"
            onClick={() => onChangeStatus(animal, 'INACTIVE')}
            disabled={isBusy}
            className={`${ACTION_CLASSES} border-slate-200 text-slate-600 hover:bg-slate-50`}
          >
            {pendingStatus === 'INACTIVE' ? <Spinner /> : <FaEyeSlash size={11} />}
            Tirar do ar
          </button>
        )}

        {animal.status === 'INACTIVE' && (
          <button
            type="button"
            onClick={() => onChangeStatus(animal, 'AVAILABLE')}
            disabled={isBusy}
            className={`${ACTION_CLASSES} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
          >
            {pendingStatus === 'AVAILABLE' ? <Spinner /> : <FaEye size={11} />}
            Colocar no ar
          </button>
        )}

        {animal.status !== 'ADOPTED' && (
          <button
            type="button"
            onClick={() => onMarkAdopted(animal)}
            disabled={isBusy}
            className={`${ACTION_CLASSES} border-amber-200 text-amber-700 hover:bg-amber-50`}
          >
            <FaCircleCheck size={11} />
            Marcar como {adoptedWord}
          </button>
        )}

        <Link
          to={`/animais/${animal.id}`}
          className={`${ACTION_CLASSES} border-slate-200 text-slate-500 hover:bg-slate-50`}
        >
          <FaEye size={11} />
          Ver no site
        </Link>
      </div>
    </li>
  )
}

export default AnimalRow
