// Situação das campanhas e eventos na visão do admin, com rótulo e cor da
// etiqueta de cada uma (as linhas e os filtros das páginas usam os mesmos)

export const CAMPAIGN_STATUS_META = {
  ACTIVE: { label: 'Recebendo doações', filterLabel: 'Ativas', className: 'bg-emerald-50 text-emerald-700' },
  CLOSED: { label: 'Encerrada', filterLabel: 'Encerradas', className: 'bg-slate-100 text-slate-500' },
  REMOVED: { label: 'Excluída pela ONG', filterLabel: 'Excluídas', className: 'bg-rose-50 text-rose-600' },
  SUSPENDED: { label: 'ONG banida', filterLabel: 'De ONG banida', className: 'bg-rose-50 text-rose-600' },
  MODERATED: {
    label: 'Removida pela moderação',
    filterLabel: 'Removidas pela moderação',
    className: 'bg-rose-50 text-rose-600',
  },
}

// Excluída (pela ONG ou pelo admin) ainda aparece aqui: as doações dela
// contam no total. De ONG banida: saiu do site, mas continua aqui
export function campaignStatus(campaign) {
  if (campaign.isRemoved) return campaign.isRemovedByModeration ? 'MODERATED' : 'REMOVED'
  if (campaign.isOngBanned) return 'SUSPENDED'
  return campaign.isClosed ? 'CLOSED' : 'ACTIVE'
}

export const EVENT_STATUS_META = {
  UPCOMING: { label: 'Próximo', filterLabel: 'Próximos', className: 'bg-emerald-50 text-emerald-700' },
  PAST: { label: 'Já aconteceu', filterLabel: 'Já aconteceram', className: 'bg-slate-100 text-slate-500' },
  CANCELLED: { label: 'Cancelado', filterLabel: 'Cancelados', className: 'bg-rose-50 text-rose-600' },
  SUSPENDED: { label: 'ONG banida', filterLabel: 'De ONG banida', className: 'bg-rose-50 text-rose-600' },
  MODERATED: {
    label: 'Removido pela moderação',
    filterLabel: 'Removidos pela moderação',
    className: 'bg-rose-50 text-rose-600',
  },
}

export function eventStatus(event) {
  if (event.status === 'CANCELLED') return event.isRemovedByModeration ? 'MODERATED' : 'CANCELLED'
  if (event.isOngBanned) return 'SUSPENDED'
  return event.isPast ? 'PAST' : 'UPCOMING'
}

const OFF_SITE_STATUSES = ['REMOVED', 'CANCELLED', 'SUSPENDED', 'MODERATED']

// Só o que ainda tem página pública ganha o link "Ver" (e pode ser removido)
export function hasPublicPage(statusKey) {
  return !OFF_SITE_STATUSES.includes(statusKey)
}

// O admin remove o que ainda está no site ou é de ONG banida (para não
// voltar se ela for reativada)
export function canRemove(statusKey) {
  return hasPublicPage(statusKey) || statusKey === 'SUSPENDED'
}

// O admin edita, com as regras da ONG, só o que ainda está valendo: o evento
// que não aconteceu e a campanha que recebe doações
export function canEdit(statusKey) {
  return statusKey === 'UPCOMING' || statusKey === 'ACTIVE'
}
