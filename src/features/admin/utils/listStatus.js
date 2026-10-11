// Situação das campanhas e eventos na visão do admin, com rótulo e cor da
// etiqueta de cada uma (as linhas e os filtros das páginas usam os mesmos)

export const CAMPAIGN_STATUS_META = {
  ACTIVE: { label: 'Recebendo doações', filterLabel: 'Ativas', className: 'bg-emerald-50 text-emerald-700' },
  CLOSED: { label: 'Encerrada', filterLabel: 'Encerradas', className: 'bg-slate-100 text-slate-500' },
  REMOVED: { label: 'Excluída pela ONG', filterLabel: 'Excluídas', className: 'bg-rose-50 text-rose-600' },
}

// Excluída pela ONG ainda aparece para o admin: as doações dela contam no total
export function campaignStatus(campaign) {
  if (campaign.isRemoved) return 'REMOVED'
  return campaign.isClosed ? 'CLOSED' : 'ACTIVE'
}

export const EVENT_STATUS_META = {
  UPCOMING: { label: 'Próximo', filterLabel: 'Próximos', className: 'bg-emerald-50 text-emerald-700' },
  PAST: { label: 'Já aconteceu', filterLabel: 'Já aconteceram', className: 'bg-slate-100 text-slate-500' },
  CANCELLED: { label: 'Cancelado', filterLabel: 'Cancelados', className: 'bg-rose-50 text-rose-600' },
}

export function eventStatus(event) {
  if (event.status === 'CANCELLED') return 'CANCELLED'
  return event.isPast ? 'PAST' : 'UPCOMING'
}
