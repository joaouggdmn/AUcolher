import { Link } from 'react-router-dom'
import { FaEye, FaUser, FaBuildingNgo, FaCalendarCheck, FaCalendarDays, FaPlus } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getYearFromIsoDate } from '../../../core/utils/formatDate'
import { FOUNDED_YEAR_FIELD_ID } from '../utils/accountForm'
import PersonAccountForm from '../components/account/PersonAccountForm'
import OngAccountForm from '../components/account/OngAccountForm'
import AccountActivity from '../components/activity/AccountActivity'

const TAG_CLASSES = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide'

// O campo fica no formulário logo abaixo: rola até ele e já deixa digitando
function focusFoundedYearField() {
  const input = document.getElementById(FOUNDED_YEAR_FIELD_ID)
  input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  input?.focus({ preventScroll: true })
}

// Pessoa: "Membro desde [ano]" (data de criação da conta). ONG: "Fundada em
// [ano]" — ou, enquanto não informou, o atalho para preencher. No perfil
// público o ano vazio é só omitido; aqui é a hora de lembrar que ele existe
function AccountDateTag({ user, isOng }) {
  if (isOng) {
    if (user?.foundedYear) {
      return (
        <span className={`${TAG_CLASSES} bg-emerald-50 text-emerald-700`}>
          <FaCalendarDays size={11} />
          Fundada em {user.foundedYear}
        </span>
      )
    }

    return (
      <button
        type="button"
        onClick={focusFoundedYearField}
        className={`${TAG_CLASSES} border border-dashed border-amber-300 bg-amber-50 text-amber-800 transition-colors duration-300 hover:bg-amber-100`}
      >
        <FaPlus size={10} />
        Adicionar ano de fundação
      </button>
    )
  }

  const memberSinceYear = getYearFromIsoDate(user?.memberSince)
  if (!memberSinceYear) return null

  return (
    <span className={`${TAG_CLASSES} bg-emerald-50 text-emerald-700`}>
      <FaCalendarCheck size={11} />
      Membro desde {memberSinceYear}
    </span>
  )
}

// O que cada tipo de conta edita é diferente (seção 6 das regras de negócio):
// pessoa física tem perfil enxuto + Perfil AUmatch; ONG tem perfil
// institucional. Os dois formulários separam "Perfil público" de "Dados da conta"
function UserProfilePage() {
  const { user } = useAuth()
  const isOng = user?.userType === 'ONG'
  const AccountForm = isOng ? OngAccountForm : PersonAccountForm

  return (
    // pb-32: espaço para a barra fixa de "alterações não salvas"
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${TAG_CLASSES} bg-slate-100 text-slate-500`}>
              {isOng ? <FaBuildingNgo size={11} /> : <FaUser size={10} />}
              {isOng ? 'Conta de instituição' : 'Conta pessoal'}
            </span>
            <AccountDateTag user={user} isOng={isOng} />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Minha conta</h1>
          <p className="mt-1 text-slate-600">
            {isOng
              ? 'Cuide da vitrine pública da instituição e dos dados de acesso.'
              : 'Mantenha seus dados atualizados para melhorar suas recomendações.'}
          </p>
        </div>

        {/* Abre a mesma página que qualquer visitante vê. Com alterações
            pendentes, o formulário intercepta a navegação e pergunta antes */}
        {user?.id != null && (
          <Link
            to={`/perfil/publico/${user.id}`}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 sm:self-auto"
          >
            <FaEye size={14} />
            Meu perfil público
          </Link>
        )}
      </header>

      {/* key: outra conta logando no mesmo navegador remonta o form com os dados dela */}
      <AccountForm key={user?.id} />

      <AccountActivity user={user} />
    </div>
  )
}

export default UserProfilePage
