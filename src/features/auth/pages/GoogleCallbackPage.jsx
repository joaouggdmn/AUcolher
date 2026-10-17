import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../core/context/AuthContext'
import { ACCOUNT_SUSPENDED_MESSAGE } from '../../../core/services/authService'
import { getErrorMessage } from '../../../core/utils/apiError'
import { getHomePath } from '../../../core/utils/panelLinks'
import { GOOGLE_LOGIN_RETURN_KEY } from '../../../core/utils/storageKeys'

const GOOGLE_FAILED_MESSAGE = 'Não foi possível entrar com o Google. Tente novamente.'

function takeReturnPath() {
  try {
    const path = sessionStorage.getItem(GOOGLE_LOGIN_RETURN_KEY)
    sessionStorage.removeItem(GOOGLE_LOGIN_RETURN_KEY)
    return path
  } catch {
    return null
  }
}

// Volta do Google (docs/entrega-final/api-login-google.md §4):
// /login/google?code=... troca o código pela sessão; ?error=suspended|failed
// volta ao login com o aviso. Fica fora do GuestRoute: é esta página que
// decide o destino depois de abrir a sessão
function GoogleCallbackPage() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // O código é de uso único e o StrictMode roda o efeito duas vezes em dev:
  // a segunda troca seria recusada
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const code = searchParams.get('code')
    const error = searchParams.get('error')

    const backToLogin = (message) => {
      takeReturnPath()
      navigate('/login', { replace: true, state: { googleError: message } })
    }

    if (!code) {
      backToLogin(error === 'suspended' ? ACCOUNT_SUSPENDED_MESSAGE : GOOGLE_FAILED_MESSAGE)
      return
    }

    loginWithGoogle(code)
      .then((loggedUser) => {
        navigate(takeReturnPath() || getHomePath(loggedUser.userType), { replace: true })
      })
      .catch((err) => backToLogin(getErrorMessage(err, GOOGLE_FAILED_MESSAGE)))
  }, [loginWithGoogle, navigate, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />
      <p className="text-sm font-semibold text-slate-500">Entrando com o Google...</p>
    </div>
  )
}

export default GoogleCallbackPage
