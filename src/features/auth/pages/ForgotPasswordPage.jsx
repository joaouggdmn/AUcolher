import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaEnvelope, FaEnvelopeCircleCheck, FaFlask } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import { getErrorMessage } from '../../../core/utils/apiError'
import { requestPasswordReset } from '../services/passwordService'
import { FORGOT_PASSWORD_NEUTRAL_MESSAGE } from '../utils/passwordRules'

const BACK_LINK_CLASSES =
  'inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900'

// 🔴 Modo mock: o link que iria por e-mail aparece aqui para testar o fluxo
function MockResetLinkBox({ result }) {
  if (!result) return null
  const testUrl = result.testLink ? new URL(result.testLink) : null
  const linkPath = testUrl ? testUrl.pathname + testUrl.search : null

  return (
    <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
      <p className="flex items-center gap-2 font-bold">
        <FaFlask size={12} />
        Modo de teste: nenhum e-mail é enviado
      </p>
      {linkPath ? (
        <>
          <p className="mt-1 text-amber-800">Este é o link que chegaria por e-mail (vale 30 minutos, uso único):</p>
          <Link to={linkPath} className="mt-1 block break-all font-semibold text-emerald-800 underline">
            {result.testLink}
          </Link>
        </>
      ) : (
        <p className="mt-1 text-amber-800">
          Já foi gerado um link para este e-mail há menos de 1 minuto, então nenhum novo foi criado.
        </p>
      )}
    </div>
  )
}

// "Esqueci minha senha" (api-senha.md §1): a resposta é sempre a mesma,
// exista conta ou não, para não revelar quais e-mails estão cadastrados
function ForgotPasswordPage() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  // { mockResult } depois de enviar; mockResult só existe no modo mock
  const [sent, setSent] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const mockResult = await requestPasswordReset(email.trim())
      setSent({ mockResult })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar o pedido. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      heading="Acontece com todo mundo."
      subheading="Informe o e-mail da sua conta e enviamos um link para você criar uma nova senha."
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">Recuperar senha</h2>
        <p className="text-sm text-slate-500">
          Lembrou?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Entrar
          </Link>
        </p>
      </div>

      {sent ? (
        <div className="mt-7 flex flex-col gap-5">
          <div className="flex gap-3 rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-900">
            <FaEnvelopeCircleCheck size={20} className="mt-0.5 shrink-0 text-emerald-700" />
            <div className="text-sm">
              <p className="font-semibold">{FORGOT_PASSWORD_NEUTRAL_MESSAGE}</p>
              <p className="mt-1 text-emerald-800">
                O link vale por 30 minutos. Não chegou? Confira também a caixa de spam.
              </p>
            </div>
          </div>

          <MockResetLinkBox result={sent.mockResult} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/login" className={BACK_LINK_CLASSES}>
              <FaArrowLeft size={12} />
              Voltar ao login
            </Link>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-800"
            >
              Usar outro e-mail
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <AuthInput
            id="email"
            name="email"
            label="E-mail da conta"
            type="email"
            icon={FaEnvelope}
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </button>

          <Link to="/login" className={`${BACK_LINK_CLASSES} self-center`}>
            <FaArrowLeft size={12} />
            Voltar ao login
          </Link>
        </form>
      )}
    </AuthForm>
  )
}

export default ForgotPasswordPage
