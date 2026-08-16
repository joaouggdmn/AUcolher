import { Link } from 'react-router-dom'
import { FaCheck, FaXmark } from 'react-icons/fa6'

const STATUS_META = {
  ACCEPTED: { label: 'Aceito', icon: FaCheck, className: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Recusado', icon: FaXmark, className: 'bg-slate-100 text-slate-500' },
}

function ResolvedRequestRow({ request }) {
  const meta = STATUS_META[request.status]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <img
        src={request.adopterMock.photoUrl}
        alt={request.adopterMock.name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-emerald-950">{request.adopterMock.name}</p>
        <p className="truncate text-xs text-slate-500">
          Interesse em{' '}
          <Link to={`/animais/${request.animal.id}`} className="font-semibold text-emerald-700 hover:underline">
            {request.animal.name}
          </Link>
        </p>
      </div>
      <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
        <Icon size={10} />
        {meta.label}
      </span>
    </div>
  )
}

export default ResolvedRequestRow