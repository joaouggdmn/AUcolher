import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaPen } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { PANEL_PATHS } from '../../ong/panel/panelPaths'
import { useChangeAnimalStatus } from '../hooks/useAnimais'

// Mesmos rótulos e cores do "Meus animais" em Minha conta
const STATUS_META = {
  AVAILABLE: {
    label: 'Disponível',
    className: 'bg-emerald-50 text-emerald-700',
    description: 'Este anúncio é seu e está no ar: aparece na vitrine e no seu perfil público.',
  },
  INACTIVE: {
    label: 'Fora do ar',
    className: 'bg-slate-100 text-slate-500',
    description: 'Este anúncio é seu e está fora do ar: só você consegue vê-lo.',
  },
  ADOPTED: {
    label: 'Adotado',
    className: 'bg-slate-100 text-slate-500',
    description: 'Este animal já foi adotado. O anúncio saiu da vitrine e não pode mais ser alterado.',
  },
}

const SUCCESS_MESSAGES = {
  AVAILABLE: 'Anúncio de volta no ar!',
  INACTIVE: 'Anúncio tirado do ar. Você pode colocá-lo de volta quando quiser.',
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)

const PRIMARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70'
const SECONDARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70'

// Ações do dono na página de detalhes: tirar do ar e voltar ao ar. O
// "adotado" só vem da conclusão do pedido, quando o adotante confirma a chegada
function OwnerListingPanel({ animal, onStatusChanged }) {
  const { user } = useAuth()
  const { mutate: changeStatus, isPending, variables } = useChangeAnimalStatus()
  const [errorMessage, setErrorMessage] = useState(null)

  const meta = STATUS_META[animal.status] ?? STATUS_META.AVAILABLE
  const pendingStatus = isPending ? variables?.status : null
  const adoptedWord = animal.sex === 'FEMALE' ? 'adotada' : 'adotado'

  const handleChange = (status) => {
    setErrorMessage(null)
    changeStatus(
      { id: animal.id, status },
      {
        onSuccess: () => onStatusChanged(SUCCESS_MESSAGES[status]),
        onError: (error) => setErrorMessage(getErrorMessage(error)),
      },
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold tracking-tight text-emerald-950">Seu anúncio</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
          {animal.status === 'ADOPTED' ? capitalize(adoptedWord) : meta.label}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-slate-500">{meta.description}</p>

      {animal.status === 'AVAILABLE' && (
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => handleChange('INACTIVE')}
            disabled={isPending}
            className={SECONDARY_BUTTON}
          >
            {pendingStatus === 'INACTIVE' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <FaEyeSlash size={14} />
            )}
            Tirar do ar
          </button>
        </div>
      )}

      {animal.status === 'INACTIVE' && (
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => handleChange('AVAILABLE')}
            disabled={isPending}
            className={PRIMARY_BUTTON}
          >
            {pendingStatus === 'AVAILABLE' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <FaEye size={14} />
            )}
            Colocar no ar de novo
          </button>
        </div>
      )}

      {/* A ONG edita pelo painel; a pessoa, pela página de edição de "Meus animais" */}
      {animal.status !== 'ADOPTED' && (
        <Link
          to={user?.userType === 'ONG' ? PANEL_PATHS.animalEdit(animal.id) : `/animais/editar/${animal.id}`}
          className="mt-3 flex w-fit items-center gap-1.5 text-sm font-bold text-emerald-700 hover:underline"
        >
          <FaPen size={11} />
          {user?.userType === 'ONG' ? 'Editar no painel da ONG' : 'Editar anúncio'}
        </Link>
      )}

      {errorMessage && (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">
          {errorMessage}
        </p>
      )}

    </div>
  )
}

export default OwnerListingPanel
