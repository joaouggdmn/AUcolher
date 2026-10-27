import { readAllCampaignsForAdmin, readApprovedDonationsForAdmin } from '../../doacoes/services/doacoesMock'

// 🔴 Campanhas e doações ainda moram no servidor falso do frontend: o backend
// não tem campanhas (migração 007, do parceiro). Os blocos da Visão geral que
// dependem delas são calculados aqui, por cima do stats da API
// (withMockCampaignStats), enquanto VITE_USE_MOCK_CAMPANHAS estiver ligada

// ONG banida pela moderação (`users.active = false` no backend)
function isNgoBanned(campaign) {
  return campaign.ngo?.active === false
}

export const RANKING_LIMIT = 5
export const RECENT_ACTIVITY_LIMIT = 8

export function monthOf(isoDate) {
  return isoDate ? isoDate.slice(0, 7) : null
}

export function countBy(items, predicate) {
  return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0)
}

export function byNewest(field) {
  return (a, b) => (b[field] ?? '').localeCompare(a[field] ?? '')
}

export function isListedCampaign(campaign) {
  return !campaign.removed && !isNgoBanned(campaign)
}

export function donationsStats(donations, months) {
  return {
    totalRaised: donations.reduce((sum, donation) => sum + donation.amount, 0),
    approvedCount: donations.length,
    raisedByMonth: months.map((month) => {
      const inMonth = donations.filter((donation) => monthOf(donation.approvedAt) === month)
      return { month, amount: inMonth.reduce((sum, donation) => sum + donation.amount, 0), count: inMonth.length }
    }),
  }
}

// `suspended`: de ONG banida (some do site, mas o dinheiro arrecadado fica)
export function campaignsStats(campaigns) {
  return {
    active: countBy(campaigns, (campaign) => isListedCampaign(campaign) && campaign.status === 'ACTIVE'),
    closed: countBy(campaigns, (campaign) => isListedCampaign(campaign) && campaign.status === 'CLOSED'),
    removed: countBy(campaigns, (campaign) => campaign.removed),
    suspended: countBy(campaigns, (campaign) => !campaign.removed && isNgoBanned(campaign)),
  }
}

export function campaignActivity(campaigns) {
  return campaigns
    .filter((campaign) => !campaign.removed)
    .map((campaign) => ({
      type: 'CAMPAIGN_CREATED',
      at: campaign.createdAt,
      id: campaign.id,
      title: campaign.title,
      detail: campaign.ngo?.name ?? null,
    }))
}

// Os ids 1 a 7 das ONGs fictícias das campanhas se repetem com os do banco
// real: uma ONG é a mesma só com id e nome iguais
function ngoKey(ngo) {
  return `${ngo.id}|${ngo.name}`
}

// Stats da API real (campanhas zeradas) + as campanhas e doações do mock:
// os blocos `donations` e `campaigns`, o ranking por arrecadado e as
// campanhas criadas na atividade recente
export function withMockCampaignStats(dto) {
  const campaigns = readAllCampaignsForAdmin()
  const donations = readApprovedDonationsForAdmin()
  const months = dto.users.newByMonth.map((point) => point.month)

  const raised = new Map()
  for (const donation of donations) {
    if (!donation.ngo) continue
    const key = ngoKey(donation.ngo)
    const entry = raised.get(key) ?? { id: donation.ngo.id, name: donation.ngo.name, raised: 0 }
    entry.raised += donation.amount
    raised.set(key, entry)
  }
  const adoptions = new Map(dto.ngoRanking.byAdoptions.map((ngo) => [ngoKey(ngo), ngo.adoptions]))

  return {
    ...dto,
    donations: donationsStats(donations, months),
    campaigns: campaignsStats(campaigns),
    ngoRanking: {
      byRaised: [...raised.values()]
        .filter((ngo) => ngo.raised > 0)
        .sort((a, b) => b.raised - a.raised)
        .slice(0, RANKING_LIMIT)
        .map((ngo) => ({ ...ngo, adoptions: adoptions.get(ngoKey(ngo)) ?? 0 })),
      byAdoptions: dto.ngoRanking.byAdoptions.map((ngo) => ({ ...ngo, raised: raised.get(ngoKey(ngo))?.raised ?? 0 })),
    },
    recentActivity: [...dto.recentActivity, ...campaignActivity(campaigns)]
      .filter((item) => item.at)
      .sort(byNewest('at'))
      .slice(0, RECENT_ACTIVITY_LIMIT),
  }
}
