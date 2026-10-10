import { todayLocalIso } from '../../../core/utils/localDate'

function daysBetween(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00`)
  const to = new Date(`${toIso}T00:00:00`)
  return Math.round((to - from) / 86_400_000)
}

function formatShortDate(isoDate) {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')
}

// Linha de prazo do card/detalhe: { label, tone } — tone pinta o texto
export function getDeadlineSummary(campaign) {
  if (campaign.isClosed) {
    const closedDay = campaign.closedAt ?? campaign.deadline
    return { label: closedDay ? `Encerrada em ${formatShortDate(closedDay)}` : 'Encerrada', tone: 'closed' }
  }
  if (!campaign.deadline) return { label: 'Sem prazo definido', tone: 'neutral' }

  const days = daysBetween(todayLocalIso(), campaign.deadline)
  if (days === 0) return { label: 'Termina hoje', tone: 'soon' }
  if (days === 1) return { label: 'Termina amanhã', tone: 'soon' }
  return { label: `Termina em ${days} dias`, tone: days <= 7 ? 'soon' : 'neutral' }
}

export function formatDonationsCount(count) {
  if (count === 0) return 'Seja o primeiro a doar'
  return `${count} ${count === 1 ? 'doação' : 'doações'}`
}

// Banner SOS: a urgente ativa mais recente (a API já manda por data de criação)
export function pickSosCampaign(campaigns) {
  return campaigns.find((campaign) => campaign.isUrgent && !campaign.isClosed) ?? null
}

export function isCampaignOwner(campaign, user) {
  return user != null && campaign.ong.id != null && String(user.id) === String(campaign.ong.id)
}
