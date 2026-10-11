import { Link } from 'react-router-dom'
import { FaEye, FaHeart, FaPaw, FaShieldHalved, FaTrashCan } from 'react-icons/fa6'
import { SPECIES_OPTIONS } from '../../animais/components/filters/filterOptions'
import { LISTING_STATUS_META } from '../../animais/utils/listingStatus'

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50'
const REMOVE_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50'

function speciesLabel(species) {
  return SPECIES_OPTIONS.find((option) => option.value === species)?.label ?? 'Animal'
}

// Mesmas rotas do site: ONG tem página própria, pessoa usa o perfil público
function ownerPath(animal) {
  return animal.listingType === 'NGO' ? `/ong/${animal.ownerId}` : `/perfil/publico/${animal.ownerId}`
}

// Um anúncio na lista do admin: o animal, a situação e quem anunciou. Adotado
// é histórico e removido já saiu: os dois não têm "Remover"
function AdminAnimalRow({ animal, onRemove }) {
  const status = LISTING_STATUS_META[animal.listingStatus]
  const canRemove = animal.listingStatus !== 'ADOPTED' && animal.listingStatus !== 'REMOVED'
  const location = [animal.city, animal.state].filter(Boolean).join(' - ')

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
            {[speciesLabel(animal.species), animal.breed, animal.ageLabel, location].filter(Boolean).join(' · ')}
          </p>
          {animal.ownerId != null && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              Anunciado por
              <Link to={ownerPath(animal)} className="font-bold text-emerald-800 hover:underline">
                {animal.ownerName || 'conta sem nome'}
              </Link>
              {animal.listingType === 'NGO' && animal.ownerIsVerified && (
                <FaShieldHalved size={10} className="text-amber-500" title="Instituição verificada" />
              )}
              {animal.ownerIsBanned && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  Conta banida
                </span>
              )}
            </p>
          )}
          {animal.pendingInterests > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
              <FaHeart size={9} />
              {animal.pendingInterests} {animal.pendingInterests === 1 ? 'pedido aguardando resposta' : 'pedidos aguardando resposta'}
            </p>
          )}
        </div>
      </div>

      {/* Fora do ar pelo dono dá 404; de conta banida o admin ainda abre */}
      {(animal.listingStatus !== 'INACTIVE' || animal.ownerIsBanned) && (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to={`/animais/${animal.id}`} className={ACTION_CLASSES}>
            <FaEye size={11} />
            Ver anúncio
          </Link>
          {canRemove && (
            <button type="button" onClick={() => onRemove(animal)} className={REMOVE_CLASSES}>
              <FaTrashCan size={11} />
              Remover
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export default AdminAnimalRow
