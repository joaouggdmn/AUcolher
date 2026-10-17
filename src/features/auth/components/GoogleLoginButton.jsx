import { useLocation } from 'react-router-dom'
import { GOOGLE_LOGIN_ENABLED } from '../../../core/utils/constants'
import { GOOGLE_LOGIN_RETURN_KEY } from '../../../core/utils/storageKeys'
import { GOOGLE_LOGIN_URL } from '../../../core/services/authService'

// O "G" colorido do Google, como pede a orientação de marca dele
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

// "Continuar com Google" (docs/entrega-final/api-login-google.md), no login e
// na aba Pessoa do cadastro: o Google só cria conta de pessoa. Só aparece com
// VITE_GOOGLE_LOGIN=true. A ida e a volta pelo Google recarregam o site, então
// a página de origem fica no sessionStorage para a /login/google voltar a ela
function GoogleLoginButton() {
  const location = useLocation()

  if (!GOOGLE_LOGIN_ENABLED) return null

  const handleClick = () => {
    const from = location.state?.from?.pathname
    try {
      if (from) sessionStorage.setItem(GOOGLE_LOGIN_RETURN_KEY, from)
      else sessionStorage.removeItem(GOOGLE_LOGIN_RETURN_KEY)
    } catch {
      // Sem sessionStorage a pessoa só volta ao início do papel
    }
    window.location.assign(GOOGLE_LOGIN_URL)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        ou
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
      >
        <GoogleLogo />
        Continuar com Google
      </button>
    </div>
  )
}

export default GoogleLoginButton
