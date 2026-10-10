import { useState } from 'react'
import { FaCircleCheck, FaEye, FaEyeSlash } from 'react-icons/fa6'
import ConfirmModal from '../../../core/components/ui/ConfirmModal'
import { getErrorMessage } from '../../../core/utils/apiError'
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
  ADOPTED: 'Que notícia boa! O animal foi marcado como adotado.',
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)

const PRIMARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70'
const SECONDARY_BUTTON =
  'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70'

// Ações do dono na página de detalhes. Tirar do ar e voltar ao ar são
// reversíveis; marcar como adotado é definitivo na API, então pede confirmação
function OwnerListingPanel({ animal, onStatusChanged }) {
  const { mutate: changeStatus, isPending, variables } = useChangeAnimalStatus()
  const [isConfirmingAdoption, setIsConfirmingAdoption] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const meta = STATUS_META[animal.status] ?? STATUS_META.AVAILABLE
  const pendingStatus = isPending ? variables?.status : null
  const adoptedWord = animal.sex === 'FEMALE' ? 'adotada' : 'adotado'

  const handleChange = (status) => {
    setErrorMessage(null)
    changeStatus(
      { id: animal.id, status },
      {
        onSuccess: () => {
          setIsConfirmingAdoption(false)
          onStatusChanged(SUCCESS_MESSAGES[status])
        },
        onError: (error) => {
          setIsConfirmingAdoption(false)
          setErrorMessage(getErrorMessage(error))
        },
      },
    )
  }

  const adoptButton = (className) => (
    <button
      type="button"
      onClick={() => setIsConfirmingAdoption(true)}
      disabled={isPending}
      className={className}
    >
      <FaCircleCheck size={14} />
      Marcar como {adoptedWord}
    </button>
  )

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
          {adoptButton(PRIMARY_BUTTON)}
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
          {adoptButton(SECONDARY_BUTTON)}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">
          {errorMessage}
        </p>
      )}

      {isConfirmingAdoption && (
        <ConfirmModal
          title={`${animal.name} foi ${adoptedWord}?`}
          message="Essa ação é definitiva: o anúncio sai da vitrine e do seu perfil público e não pode mais ser editado nem voltar ao ar."
          confirmLabel={pendingStatus === 'ADOPTED' ? 'Salvando...' : `Sim, foi ${adoptedWord}`}
          onConfirm={() => handleChange('ADOPTED')}
          onCancel={() => setIsConfirmingAdoption(false)}
          isConfirming={pendingStatus === 'ADOPTED'}
        />
      )}
    </div>
  )
}

export default OwnerListingPanel
