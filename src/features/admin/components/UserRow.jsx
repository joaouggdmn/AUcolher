import { Link } from 'react-router-dom'
import { FaEye, FaShieldHalved } from 'react-icons/fa6'
import Avatar from '../../../core/components/ui/Avatar'

const TYPE_META = {
  ONG: { label: 'ONG', className: 'bg-amber-50 text-amber-700' },
  PESSOA: { label: 'Pessoa', className: 'bg-sky-50 text-sky-700' },
}

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50'

function memberSince(createdAt) {
  if (!createdAt) return null
  return `Desde ${new Date(createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
}

function animalsText(count) {
  if (count === 0) return 'Nenhum animal anunciado'
  return `${count} ${count === 1 ? 'animal anunciado' : 'animais anunciados'}`
}

// Mesmas rotas do site: ONG tem página própria, pessoa usa o perfil público
function profilePath(user) {
  return user.userType === 'ONG' ? `/ong/${user.id}` : `/perfil/publico/${user.id}`
}

// Uma conta na lista do admin: quem é, de onde, desde quando e quanto anuncia
function UserRow({ user }) {
  const type = TYPE_META[user.userType] ?? TYPE_META.PESSOA
  const location = [user.city, user.state].filter(Boolean).join(' - ')

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Avatar name={user.name} photoUrl={user.photoUrl} className="h-12 w-12 text-base" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{user.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${type.className}`}>{type.label}</span>
            {user.isVerified && (
              <FaShieldHalved size={12} className="shrink-0 text-amber-500" title="Instituição verificada" />
            )}
            {!user.isActive && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">Banida</span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">{[user.email, location].filter(Boolean).join(' · ')}</p>
          <p className="text-xs text-slate-400">
            {[memberSince(user.createdAt), animalsText(user.animalsCount)].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link to={profilePath(user)} className={ACTION_CLASSES}>
          <FaEye size={11} />
          Ver perfil
        </Link>
      </div>
    </li>
  )
}

export default UserRow
