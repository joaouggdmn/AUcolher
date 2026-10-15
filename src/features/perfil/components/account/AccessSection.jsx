import { useState } from 'react'
import { FaEnvelope, FaEnvelopeCircleCheck, FaKey } from 'react-icons/fa6'
import FormField from '../../../../core/components/ui/FormField'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import MockResetLinkBox from '../../../auth/components/MockResetLinkBox'
import { requestPasswordReset } from '../../../auth/services/passwordService'
import ProfileSection from '../ProfileSection'

// Só leitura: o banco guarda o hash, não a senha, então não há o que mostrar
const MASKED_PASSWORD = '••••••••'

// "Acesso" de pessoa e ONG: e-mail e senha, os dois só para ver. Trocar a
// senha é pelo mesmo link do "Esqueci minha senha" (api-senha.md §8), enviado
// ao e-mail da conta — quem tem acesso ao e-mail prova que é dono da conta.
// Fica dentro do AccountFormShell, mas o estado é próprio: pedir o link não
// conta como alteração não salva do perfil
function AccessSection({ emailHint }) {
  const { user } = useAuth()
  const hasPassword = user?.hasPassword ?? true

  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  // { mockResult } depois de enviar; mockResult só existe no modo mock
  const [sent, setSent] = useState(null)

  const handleRequestLink = async () => {
    if (isSending || !user?.email) return
    setIsSending(true)
    setError(null)

    try {
      const mockResult = await requestPasswordReset(user.email)
      setSent({ mockResult })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar o link. Tente novamente.'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <ProfileSection icon={FaEnvelope} title="Acesso" description="E-mail e senha usados para entrar na plataforma">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="E-mail" value={user?.email ?? ''} disabled hint={emailHint} />
        <FormField
          label="Senha"
          type={hasPassword ? 'password' : 'text'}
          value={hasPassword ? MASKED_PASSWORD : 'Nenhuma senha criada'}
          disabled
          hint={
            hasPassword
              ? 'Por segurança, a senha não é exibida.'
              : 'Você entra pelo Google. Com uma senha, também entra com e-mail e senha.'
          }
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">
        {sent ? (
          <div className="flex gap-3 rounded-2xl bg-emerald-50 px-4 py-3.5 text-emerald-900">
            <FaEnvelopeCircleCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                Enviamos um link para <span className="break-all">{user?.email}</span>.
              </p>
              <p className="mt-0.5 text-emerald-800">
                Ele vale por 30 minutos. Não chegou? Confira também a caixa de spam.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {hasPassword
              ? 'Para alterar a senha, enviamos um link de redefinição para o seu e-mail.'
              : 'Para criar uma senha, enviamos um link para o seu e-mail.'}
          </p>
        )}

        <MockResetLinkBox result={sent?.mockResult} />

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleRequestLink}
          disabled={isSending}
          className="flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          ) : (
            <FaKey size={12} />
          )}
          {isSending ? 'Enviando...' : sent ? 'Enviar de novo' : hasPassword ? 'Alterar senha' : 'Criar senha'}
        </button>
      </div>
    </ProfileSection>
  )
}

export default AccessSection
