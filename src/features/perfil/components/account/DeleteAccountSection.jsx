import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaTrashCan, FaTriangleExclamation } from 'react-icons/fa6'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { deleteMyAccount } from '../../services/userService'

const CONFIRMATION_WORD = 'EXCLUIR'

// "Zona de perigo" no fim de Minha conta (contratos-prontos/api-exclusao-conta.md §7), para
// pessoa e ONG. Fica dentro do AccountFormShell, mas o estado é próprio: nada
// aqui conta como alteração não salva do perfil. Conta com senha confirma com
// a senha; conta do Google sem senha digita EXCLUIR. O admin não exclui a
// própria conta (a API responde 403), então a seção nem aparece para ele
function DeleteAccountSection() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const hasPassword = user?.hasPassword ?? true
  const isOng = user?.userType === 'ONG'

  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const isFilled = hasPassword ? value.length > 0 : value.trim() === CONFIRMATION_WORD

  if (user?.userType === 'ADMIN') return null

  const open = () => {
    setValue('')
    setError(null)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (!isFilled || isDeleting) return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteMyAccount(hasPassword ? { password: value } : { confirmation: CONFIRMATION_WORD })
      logout()
      navigate('/', { replace: true, state: { flash: 'Sua conta foi excluída.' } })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível excluir a conta. Tente novamente.'))
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <FaTriangleExclamation size={16} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-rose-700">Excluir conta</h2>
          <p className="text-sm text-slate-500">
            A exclusão é definitiva e não pode ser desfeita. Seus dados pessoais são apagados.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={open}
        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-5 text-sm font-bold text-rose-600 transition-all duration-300 hover:border-rose-300 hover:bg-rose-50"
      >
        <FaTrashCan size={12} />
        Excluir minha conta
      </button>

      {isOpen && (
        <ConfirmDialog
          icon={FaTrashCan}
          variant="danger"
          title="Excluir sua conta?"
          description={
            <div className="flex flex-col gap-3 text-left">
              <ul className="list-disc space-y-1 pl-5">
                <li>seus anúncios saem do ar;</li>
                <li>os pedidos de adoção em andamento são cancelados;</li>
                {isOng && <li>suas campanhas saem do ar (as ativas são encerradas) e os eventos futuros são cancelados;</li>}
                <li>o histórico das outras pessoas fica, com o nome "Conta excluída".</li>
              </ul>
              <label className="flex flex-col gap-1.5">
                <span className="font-semibold text-slate-700">
                  {hasPassword ? 'Digite sua senha para confirmar' : `Digite ${CONFIRMATION_WORD} para confirmar`}
                </span>
                <input
                  type={hasPassword ? 'password' : 'text'}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleConfirm()
                  }}
                  autoComplete={hasPassword ? 'current-password' : 'off'}
                  disabled={isDeleting}
                  autoFocus
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                />
              </label>
            </div>
          }
          confirmLabel="Excluir conta"
          processingLabel="Excluindo..."
          isProcessing={isDeleting}
          confirmDisabled={!isFilled}
          error={error}
          onConfirm={handleConfirm}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}

export default DeleteAccountSection
