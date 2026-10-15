import { Link } from 'react-router-dom'
import { FaComments, FaPaw } from 'react-icons/fa6'
import { formatDateBr } from '../../../../core/utils/formatDate'
import { animalDisplayName } from '../../../adocao/utils/requestAnimal'

// Uma adoção feita pela pessoa ("Meus animais" → Adotados por mim): o
// animal, quem doou, quando chegou e a conversa do pedido. `children` traz
// a situação e as ações de cada etapa
function AdoptedAnimalCard({ request, onGoToChat, children }) {
  const { animal } = request
  const animalName = animalDisplayName(animal)
  const donorName = animal.organizationName ?? animal.ownerName
  const donorPath = animal.listingType === 'NGO' ? `/ong/${request.ownerId}` : `/perfil/publico/${request.ownerId}`

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <Link
        to={`/animais/${animal.id}`}
        className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-3 transition-colors duration-300 hover:bg-emerald-50"
      >
        {animal.photoUrl ? (
          <img src={animal.photoUrl} alt={animalName} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
            <FaPaw size={18} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{animalName}</p>
          <p className="truncate text-xs text-slate-500">{[animal.breed, animal.ageLabel].filter(Boolean).join(' · ')}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs text-slate-500">
          Adotado de{' '}
          <Link to={donorPath} className="font-semibold text-emerald-700 hover:underline">
            {donorName}
          </Link>
          {request.concludedAt && <> · chegou em {formatDateBr(request.concludedAt)}</>}
        </p>

        {children}

        <button
          type="button"
          onClick={() => onGoToChat(request.id)}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 py-2.5 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-50"
        >
          <FaComments size={13} />
          Ver a conversa
        </button>
      </div>
    </li>
  )
}

export default AdoptedAnimalCard
