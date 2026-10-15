import { useCallback, useState } from 'react'
import { FaLock } from 'react-icons/fa6'
import FormField from '../../../../core/components/ui/FormField'
import SuccessToast from '../../../../core/components/ui/SuccessToast'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { USE_MOCK_SENHA } from '../../../../core/utils/constants'
import { PASSWORD_MIN_LENGTH, validateNewPassword } from '../../../auth/utils/passwordRules'
import ProfileSection from '../ProfileSection'

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }

// "Trocar senha" (atual + nova) ou, em conta do Google sem senha, "Definir
// senha" (só a nova). Form próprio, fora do AccountFormShell: senha não entra
// na barra de "alterações não salvas" do perfil
function PasswordForm() {
  const { user, changePassword } = useAuth()
  const hasPassword = user?.hasPassword ?? true

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const errors = validateNewPassword(formData, { requireCurrent: hasPassword })
    setFieldErrors(errors)
    setSubmitError(null)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await changePassword({
        currentPassword: hasPassword ? formData.currentPassword : null,
        newPassword: formData.newPassword,
      })
      setFormData(EMPTY_FORM)
      setSuccessMessage(
        hasPassword ? 'Senha alterada. As outras sessões foram encerradas.' : 'Senha definida. Agora você também entra com e-mail e senha.'
      )
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Não foi possível alterar a senha. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProfileSection
      icon={FaLock}
      title={hasPassword ? 'Trocar senha' : 'Definir senha'}
      description={
        hasPassword
          ? 'Ao trocar, as sessões abertas em outros navegadores e no celular são encerradas'
          : 'Sua conta entra pelo Google. Com uma senha, você também pode entrar com e-mail e senha'
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hasPassword && (
            <FormField
              label="Senha atual"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={fieldErrors.currentPassword}
              autoComplete="current-password"
              className="sm:col-span-2"
            />
          )}
          <FormField
            label="Nova senha"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            hint={`No mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
            autoComplete="new-password"
          />
          <FormField
            label="Confirmar nova senha"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{submitError}</p>
        )}

        {USE_MOCK_SENHA && (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
            Modo de teste: a senha atual é conferida de verdade, mas a nova ainda não é gravada. Continue entrando com a
            senha de antes.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-emerald-800 px-6 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isSubmitting ? 'Salvando...' : hasPassword ? 'Trocar senha' : 'Definir senha'}
        </button>

        <SuccessToast message={successMessage} onClose={clearSuccessMessage} />
      </form>
    </ProfileSection>
  )
}

export default PasswordForm
