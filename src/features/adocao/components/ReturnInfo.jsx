import { Link } from 'react-router-dom'
import { FaArrowRight, FaBullhorn, FaRotateLeft } from 'react-icons/fa6'
import { formatDateBr } from '../../../core/utils/formatDate'
import { RETURN_REASON_LABELS } from '../utils/requestStatus'

function titleOf({ type, date }, viewer) {
  const when = formatDateBr(date)
  if (type === 'RETURNED') return `Devolvido ao doador em ${when}`
  return viewer === 'adopter' ? `Republicado por você em ${when}` : `Repassado pelo adotante em ${when}`
}

// O que aconteceu depois da adoção (regras §3.3): o animal voltou para quem
// doou (RETURNED) ou o adotante o anunciou de novo (REHOMED), com o motivo e
// a observação. As duas partes veem; no repasse, o link leva ao anúncio novo.
// `viewer`: 'owner' (doador) ou 'adopter'
function ReturnInfo({ request, viewer }) {
  const info = request.returnInfo
  if (!info) return null
  const Icon = info.type === 'RETURNED' ? FaRotateLeft : FaBullhorn

  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 px-3.5 py-2.5 text-sky-800">
      <Icon size={13} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-extrabold">{titleOf(info, viewer)}</p>
        <p className="text-xs font-medium opacity-90">Motivo: {RETURN_REASON_LABELS[info.reason] ?? info.reason}</p>
        {info.note && <p className="mt-1 break-words text-xs italic opacity-80">“{info.note}”</p>}
        {info.type === 'REHOMED' && info.rehomedAnimalId != null && (
          <Link
            to={`/animais/${info.rehomedAnimalId}`}
            className="mt-1.5 flex w-fit items-center gap-1 text-xs font-bold text-sky-700 hover:underline"
          >
            {viewer === 'adopter' ? 'Ver o seu anúncio' : 'Ver o novo anúncio'}
            <FaArrowRight size={9} />
          </Link>
        )}
      </div>
    </div>
  )
}

export default ReturnInfo
