import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import SuccessToast from '../../../../core/components/ui/SuccessToast'
import { getErrorMessage } from '../../../../core/utils/apiError'
import UnsavedChangesBar from './UnsavedChangesBar'
import LeaveConfirmModal from './LeaveConfirmModal'

const ACCOUNT_FORM_ID = 'account-form'

// Casca comum aos formulários de pessoa e ONG: submit, barra de alterações
// pendentes e o bloqueio de navegação. Sem o bloqueio, clicar em "Meu
// perfil público" com edições pendentes mostrava a versão antiga do perfil.
// onSave é assíncrono (PUT /usuarios/me) e rejeita quando a API recusa
function AccountFormShell({ isDirty, onSave, onDiscard, children }) {
  const formRef = useRef(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), [])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  )

  // Fechar a aba ou recarregar: o navegador mostra o próprio aviso
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Devolve se deu certo. O erro fica na barra de alterações, que continua
  // aberta porque o form segue com as alterações pendentes
  const runSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave()
      return true
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Não foi possível salvar o perfil. Tente novamente.'))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSaving) return
    if (await runSave()) setSuccessMessage('Perfil atualizado com sucesso!')
  }

  const handleDiscard = () => {
    setSaveError(null)
    onDiscard()
  }

  const handleSaveAndLeave = async () => {
    // Mesma validação nativa do submit (e-mail, link do Facebook, campos
    // obrigatórios): se falhar, fecha o modal e aponta o campo com erro
    if (!formRef.current?.checkValidity()) {
      blocker.reset?.()
      requestAnimationFrame(() => formRef.current?.reportValidity())
      return
    }
    // Se a API recusar, fica na página para a pessoa ver o erro e corrigir
    if (await runSave()) blocker.proceed?.()
    else blocker.reset?.()
  }

  const handleDiscardAndLeave = () => {
    handleDiscard()
    blocker.proceed?.()
  }

  return (
    <>
      <form id={ACCOUNT_FORM_ID} ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
        {children}
      </form>

      {isDirty && (
        <UnsavedChangesBar
          formId={ACCOUNT_FORM_ID}
          onDiscard={handleDiscard}
          isSaving={isSaving}
          errorMessage={saveError}
        />
      )}

      {blocker.state === 'blocked' && (
        <LeaveConfirmModal
          isSaving={isSaving}
          onSave={handleSaveAndLeave}
          onDiscard={handleDiscardAndLeave}
          onStay={() => blocker.reset?.()}
        />
      )}

      <SuccessToast message={successMessage} onClose={clearSuccessMessage} />
    </>
  )
}

export default AccountFormShell
