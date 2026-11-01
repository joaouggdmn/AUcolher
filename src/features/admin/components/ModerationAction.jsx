import { useState } from 'react'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import { getErrorMessage } from '../../../core/utils/apiError'

const APPEARANCES = {
  // Bloco de ação das páginas de detalhe (anúncio, evento, campanha)
  block: {
    danger:
      'flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white py-3.5 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50',
    default:
      'flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white py-3.5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50',
  },
  // Ao lado das redes sociais, no cabeçalho do perfil (como o "Denunciar")
  pill: {
    danger:
      'flex h-10 items-center gap-2 rounded-full border border-rose-200 px-4 text-xs font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50',
    default:
      'flex h-10 items-center gap-2 rounded-full border border-emerald-200 px-4 text-xs font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50',
  },
}

// Uma decisão do admin fora do painel — no anúncio, no perfil, no evento ou
// na campanha. Abre a mesma confirmação do painel (`dialog`: title,
// description, confirmLabel, processingLabel) e roda a mutation dos hooks de
// useAdmin, que já atualizam as telas do site. `onDone` recebe o retorno
function ModerationAction({ icon: Icon, label, variant = 'danger', appearance = 'block', dialog, mutation, variables, onDone }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleOpen() {
    mutation.reset()
    setIsOpen(true)
  }

  function handleConfirm() {
    mutation.mutate(variables, {
      onSuccess: (result) => {
        setIsOpen(false)
        onDone?.(result)
      },
    })
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={APPEARANCES[appearance][variant]}>
        <Icon size={appearance === 'pill' ? 11 : 13} />
        {label}
      </button>

      {isOpen && (
        <ConfirmDialog
          icon={Icon}
          variant={variant}
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          processingLabel={dialog.processingLabel}
          isProcessing={mutation.isPending}
          error={mutation.isError ? getErrorMessage(mutation.error) : null}
          onConfirm={handleConfirm}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default ModerationAction
