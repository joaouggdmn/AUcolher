import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaLinkSlash, FaLock } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { USE_MOCK_SENHA } from '../../../core/utils/constants'
import { checkResetToken, resetPassword } from '../services/passwordService'
import { INVALID_RESET_LINK_MESSAGE, PASSWORD_MIN_LENGTH, validateNewPassword } from '../utils/passwordRules'

const PRIMARY_BUTTON_CLASSES =
  'flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60'

function isInvalidLinkError(error) {
  return error.response?.status === 400 && error.response.data?.message === INVALID_RESET_LINK_MESSAGE
}

// Link do e-mail de "Esqueci minha senha": /redefinir-senha?token=...
// Fica fora do GuestRoute — quem estiver logado neste navegador também
// precisa conseguir usar o link (senão ia para a home e perdia o token)
function ResetPasswordPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Lido uma vez: logo depois o token sai da barra de endereço
  const [token] = useState(() => searchParams.get('token'))
  // checking → valid | invalid
  const [linkStatus, setLinkStatus] = useState(token ? 'checking' : 'invalid')
  const [linkError, setLinkError] = useState(INVALID_RESET_LINK_MESSAGE)

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasTokenInUrl = searchParams.has('token')

  // Tira o token do histórico do navegador
  useEffect(() => {
    if (hasTokenInUrl) navigate(location.pathname, { replace: true })
  }, [hasTokenInUrl, location.pathname, navigate])

  // Confere o link ao abrir: vencido ou já usado nem mostra o formulário
  useEffect(() => {
    if (!token) return undefined
    let isCurrent = true

    checkResetToken(token)
      .then(() => {
        if (isCurrent) setLinkStatus('valid')
      })
      .catch((error) => {
        if (!isCurrent) return
        setLinkError(getErrorMessage(error, INVALID_RESET_LINK_MESSAGE))
        setLinkStatus('invalid')
      })

    return () => {
      isCurrent = false
    }
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const errors = validateNewPassword(formData, { requireCurrent: false })
    setFieldErrors(errors)
    setSubmitError(null)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword: formData.newPassword })
      // Todas as sessões caem na API; a deste navegador sai junto, e a
      // pessoa entra de novo com a senha nova (não entra automaticamente)
      logout()
      navigate('/login', { replace: true, state: { passwordReset: true } })
    } catch (error) {
      if (isInvalidLinkError(error)) {
        setLinkError(error.response.data.message)
        setLinkStatus('invalid')
      } else {
        setSubmitError(getErrorMessage(error, 'Não foi possível redefinir a senha. Tente novamente.'))
      }
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      heading="Uma senha nova, e de volta aos pets."
      subheading="Escolha uma senha que você não use em outros sites."
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">Redefinir senha</h2>
        <p className="text-sm text-slate-500">
          Lembrou?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Entrar
          </Link>
        </p>
      </div>

      {linkStatus === 'checking' && (
        <div className="mt-10 flex items-center justify-center gap-3 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          Conferindo o link...
        </div>
      )}

      {linkStatus === 'invalid' && (
        <div className="mt-7 flex flex-col gap-5">
          <div className="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-rose-800">
            <FaLinkSlash size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{linkError}</p>
          </div>
          <Link to="/recuperar-senha" className={PRIMARY_BUTTON_CLASSES}>
            Pedir um novo link
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 self-center text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            <FaArrowLeft size={12} />
            Voltar ao login
          </Link>
        </div>
      )}

      {linkStatus === 'valid' && (
        <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
          <AuthInput
            id="newPassword"
            name="newPassword"
            label="Nova senha"
            type="password"
            icon={FaLock}
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            hint={`No mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
            autoComplete="new-password"
          />

          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar nova senha"
            type="password"
            icon={FaLock}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          {submitError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{submitError}</p>
          )}

          {USE_MOCK_SENHA && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
              Modo de teste: o link é conferido e marcado como usado, mas a senha nova ainda não é gravada. Continue
              entrando com a senha de antes.
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className={`mt-1 ${PRIMARY_BUTTON_CLASSES}`}>
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </AuthForm>
  )
}

export default ResetPasswordPage
