import { Link } from 'react-router-dom'
import { FaEye, FaPaw } from 'react-icons/fa6'
import Avatar from '../../../core/components/ui/Avatar'
import { getReasonLabel } from '../../denuncias/utils/reportRules'
import { RESOLUTION_META } from '../utils/reportCases'

const LINK_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50'

const ACTION_VARIANTS = {
  default: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}

const TYPE_LABELS = { ANIMAL: 'Anúncio', ONG: 'Perfil de ONG', PESSOA: 'Perfil de pessoa' }

function formatDate(isoDateTime) {
  return new Date(isoDateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Mesmas rotas do site: ONG tem página própria, pessoa usa o perfil público
function profilePath(id, userType) {
  return userType === 'ONG' ? `/ong/${id}` : `/perfil/publico/${id}`
}

// Pessoa: foto redonda. ONG e anúncio: quadrada, como no resto do site
function TargetThumb({ reportCase }) {
  const { target } = reportCase
  const isUser = reportCase.targetType === 'USER'

  if (isUser && target.userType !== 'ONG') {
    return <Avatar name={target.name} photoUrl={target.photoUrl} className="h-14 w-14 text-lg" />
  }
  return (
    <span
      className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-black ${
        isUser ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-600'
      }`}
    >
      {target.photoUrl ? (
        <img src={target.photoUrl} alt={target.name} className="h-full w-full object-cover" />
      ) : isUser ? (
        target.name?.charAt(0).toUpperCase()
      ) : (
        <FaPaw size={18} />
      )}
    </span>
  )
}

// Um caso de denúncia: o alvo (cópia guardada na denúncia), quantas vezes e
// por quê foi denunciado, cada denúncia com quem fez e o que contou, e as
// decisões possíveis (`actions`: [{ label, icon, variant, onClick }])
function ReportCaseCard({ reportCase, actions = [] }) {
  const { target, reports } = reportCase
  const isAnimal = reportCase.targetType === 'ANIMAL'
  const resolution = RESOLUTION_META[reportCase.resolution]
  const location = [target.city, target.state].filter(Boolean).join(' - ')

  return (
    <li className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <TargetThumb reportCase={reportCase} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{target.name}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {TYPE_LABELS[isAnimal ? 'ANIMAL' : target.userType] ?? 'Perfil'}
              </span>
              {reportCase.isPending ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  {reports.length} {reports.length === 1 ? 'denúncia' : 'denúncias'}
                </span>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${resolution?.className ?? ''}`}>
                  {resolution?.label}
                </span>
              )}
            </div>

            {isAnimal && target.ownerId != null && (
              <p className="mt-0.5 text-xs text-slate-500">
                Anunciado por{' '}
                <Link
                  to={profilePath(target.ownerId, target.ownerUserType)}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  {target.ownerName || 'conta sem nome'}
                </Link>
              </p>
            )}
            {!isAnimal && location && <p className="mt-0.5 text-xs text-slate-500">{location}</p>}

            <div className="mt-2 flex flex-wrap gap-1.5">
              {reportCase.reasonCounts.map(({ reason, count }) => (
                <span key={reason} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  {getReasonLabel(reason)}
                  {count > 1 && ` · ${count}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          to={isAnimal ? `/animais/${reportCase.targetId}` : profilePath(reportCase.targetId, target.userType)}
          className={`${LINK_CLASSES} shrink-0 self-start`}
        >
          <FaEye size={11} />
          {isAnimal ? 'Ver anúncio' : 'Ver perfil'}
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        {reports.map((report) => (
          <li key={report.id} className="flex items-start gap-3">
            <Avatar name={report.reporter?.name} photoUrl={report.reporter?.photoUrl} className="h-8 w-8 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">
                <span className="font-bold text-emerald-950">{report.reporter?.name ?? 'Conta removida'}</span>
                {' · '}
                {getReasonLabel(report.reason)}
                {' · '}
                {formatDate(report.createdAt)}
              </p>
              {report.description ? (
                <p className="mt-0.5 break-words text-sm leading-relaxed text-slate-600">{report.description}</p>
              ) : (
                <p className="mt-0.5 text-sm italic text-slate-400">Sem descrição.</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {actions.map(({ label, icon: Icon, variant = 'default', onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${ACTION_VARIANTS[variant]}`}
            >
              {Icon && <Icon size={11} />}
              {label}
            </button>
          ))}
        </div>
      )}

      {!reportCase.isPending && reportCase.resolvedAt && (
        <p className="mt-3 text-right text-xs text-slate-400">Julgado em {formatDate(reportCase.resolvedAt)}</p>
      )}
    </li>
  )
}

export default ReportCaseCard
