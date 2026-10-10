import { Link } from 'react-router-dom'
import { FaComments, FaInbox, FaPaw, FaReply } from 'react-icons/fa6'
import { REQUEST_STATUS_META } from '../../../adocao/utils/requestStatus'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import BarList from './charts/BarList'
import ChartCard from './charts/ChartCard'

// Etapas em ordem: um tom só, escurecendo a cada passo (rampa conferida para
// contraste). Cada etapa conta quem chegou nela ou passou dela
const FUNNEL_STAGES = [
  { key: 'received', label: 'Pedidos recebidos', statuses: null, colorClass: 'bg-emerald-500' },
  { key: 'accepted', label: 'Aceitos', statuses: ['ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED'], colorClass: 'bg-emerald-600' },
  { key: 'delivery', label: 'Entrega confirmada', statuses: ['AWAITING_DELIVERY', 'CONCLUDED'], colorClass: 'bg-emerald-700' },
  { key: 'concluded', label: 'Adoções concluídas', statuses: ['CONCLUDED'], colorClass: 'bg-emerald-800' },
]

const ACTION_CLASSES =
  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300'

function formatDate(isoDateTime) {
  return new Date(isoDateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function RequestAction({ request }) {
  if (request.status === 'PENDING') {
    return (
      <Link to="/interesses-recebidos" className={`${ACTION_CLASSES} border-amber-200 text-amber-700 hover:bg-amber-50`}>
        <FaReply size={10} />
        Responder
      </Link>
    )
  }
  if (request.status === 'ACCEPTED' || request.status === 'AWAITING_DELIVERY') {
    return (
      <Link
        to="/chat"
        state={{ requestId: request.id }}
        className={`${ACTION_CLASSES} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
      >
        <FaComments size={10} />
        Conversar
      </Link>
    )
  }
  return null
}

function RequestRow({ request }) {
  const status = REQUEST_STATUS_META[request.status]
  const { adopter, animal } = request
  const place = adopter.city ? `${adopter.city}/${adopter.state}` : null
  const date = request.status === 'CONCLUDED' && request.concludedAt
    ? `adotado em ${formatDate(request.concludedAt)}`
    : `pedido em ${formatDate(request.createdAt)}`

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-600">
        {animal.photoUrl ? (
          <img src={animal.photoUrl} alt={animal.name ?? ''} className="h-full w-full object-cover" />
        ) : (
          <FaPaw size={16} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className={`truncate text-sm font-bold ${animal.name ? 'text-emerald-950' : 'text-slate-400'}`}>
            {animal.name ?? 'Animal não encontrado'}
          </p>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
        </div>
        <p className="truncate text-xs text-slate-500">{[adopter.name, place, date].filter(Boolean).join(' · ')}</p>
      </div>
      <RequestAction request={request} />
    </li>
  )
}

function RequestGroup({ title, requests }) {
  if (requests.length === 0) return null

  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
        {title} <span className="text-slate-300">· {requests.length}</span>
      </h3>
      <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {requests.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </ul>
    </section>
  )
}

// Aba "Adoções": pedidos recebidos agrupados pela etapa. Aceitar e recusar
// continuam em Interesses recebidos, que tem o perfil completo do interessado
function OngAdoptionsPanel({ requests }) {
  if (requests.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaInbox}
        title="Nenhum pedido de adoção ainda."
        description="Quando alguém demonstrar interesse em um dos animais da ONG, o pedido aparece aqui."
      />
    )
  }

  const byStatus = (...statuses) => requests.filter((request) => statuses.includes(request.status))
  const groups = [
    { title: 'Aguardando sua resposta', requests: byStatus('PENDING') },
    { title: 'Em andamento', requests: byStatus('ACCEPTED', 'AWAITING_DELIVERY') },
    { title: 'Concluídas', requests: byStatus('CONCLUDED') },
  ]
  const closedCount = byStatus('REJECTED', 'CANCELLED').length
  const funnel = FUNNEL_STAGES.map(({ statuses, ...stage }) => {
    const value = statuses ? byStatus(...statuses).length : requests.length
    return { ...stage, value, note: `${Math.round((value / requests.length) * 100)}%` }
  })

  return (
    <div className="flex flex-col gap-8">
      <ChartCard title="Do pedido à adoção" subtitle="Quantos pedidos chegaram a cada etapa, em relação ao total recebido">
        <BarList items={funnel} />
      </ChartCard>

      {groups.every((group) => group.requests.length === 0) && (
        <p className="py-4 text-center text-sm text-slate-400">Nenhum pedido em aberto no momento.</p>
      )}
      {groups.map((group) => (
        <RequestGroup key={group.title} {...group} />
      ))}
      {closedCount > 0 && (
        <p className="text-xs text-slate-400">
          {closedCount} {closedCount === 1 ? 'pedido recusado ou cancelado fica' : 'pedidos recusados ou cancelados ficam'} no
          histórico de <Link to="/interesses-recebidos" className="font-semibold text-emerald-700 hover:underline">Interesses recebidos</Link>.
        </p>
      )}
    </div>
  )
}

export default OngAdoptionsPanel
