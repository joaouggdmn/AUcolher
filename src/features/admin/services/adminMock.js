import {
  createMockStore,
  getMockSession,
  isSameId,
  mockDelay,
  mockHttpError,
  nextId,
} from '../../../core/services/mock/mockStore'
import { ADOPTION_REQUESTS_STORAGE_KEY, MOCK_ADMIN_STORE_KEY } from '../../../core/utils/storageKeys'
import { toLocalIsoDate, todayLocalIso } from '../../../core/utils/localDate'
import * as adocaoApi from '../../adocao/services/adocaoApi'
import * as animaisApi from '../../animais/services/animaisApi'
import { withAdoptionStatus } from '../../animais/utils/listingStatus'
import {
  readAllCampaignsForAdmin,
  readApprovedDonationsForAdmin,
  removeCampaignForAdmin,
} from '../../doacoes/services/doacoesMock'
import {
  findReportForAdmin,
  readAllReportsForAdmin,
  resolvePendingReportsForAdmin,
} from '../../denuncias/services/denunciasMock'
import { reportTargetKey } from '../../denuncias/utils/reportRules'
import { readAllEventsForAdmin, removeEventForAdmin } from '../../eventos/services/eventosMock'
import { buildSeedAdmin } from '../data/seedAdmin'
import {
  banAccount,
  isAccountBanned,
  isAnimalRemoved,
  matchesAccount,
  reactivateAccount,
  removeAnimalListing,
} from './moderationMock'

// 🔴 Servidor falso do painel do admin: mesmas funções de adminApi.js e os
// DTOs de docs/api-admin.md. A API ainda não lista contas, então elas vivem
// aqui (seedAdmin.js); o resto vem de onde já mora hoje:
//   animais  → API real (GET /api/animals, só os disponíveis) + adotados
//              tirados dos pedidos concluídos
//   pedidos  → API real (GET /api/admin/adoption-requests) + os de
//              demonstração do admin (só em dev, no localStorage)
//   campanhas, doações, eventos e denúncias → os outros servidores falsos
const store = createMockStore({ key: MOCK_ADMIN_STORE_KEY, version: 1, seed: buildSeedAdmin })

// Séries mensais: os últimos 12 meses (a tela mostra os que quiser)
const SERIES_MONTHS = 12
// Máximo que a API aceita por página
const ANIMALS_PAGE_SIZE = 50
const RANKING_LIMIT = 5
const RECENT_ACTIVITY_LIMIT = 8

const ACCEPTED_OR_LATER = ['ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED']
const DELIVERY_OR_LATER = ['AWAITING_DELIVERY', 'CONCLUDED']

// ---------- helpers do "backend" ----------

function requireAdmin() {
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  if (user.userType !== 'ADMIN') throw mockHttpError(403, 'Apenas o admin pode ver os dados da plataforma.')
  return user
}

function byNewest(field) {
  return (a, b) => (b[field] ?? '').localeCompare(a[field] ?? '')
}

// Pedido da API no formato que as estatísticas daqui leem (o mesmo dos
// pedidos de demonstração): cópia do animal em `animal`, adotante em `adopter`
function toStatsRequest(dto) {
  const ownerIsNgo = dto.owner.userType === 'NGO'
  return {
    id: dto.id,
    status: dto.status,
    cancelReason: dto.cancelReason,
    createdAt: dto.createdAt,
    concludedAt: dto.concludedAt,
    animalId: dto.animal.id,
    ownerId: dto.owner.id,
    animalSource: 'api',
    animal: {
      id: dto.animal.id,
      name: dto.animal.name,
      species: dto.animal.species,
      photoUrl: dto.animal.coverPhoto,
      ownerName: dto.owner.name,
      ownerPhotoUrl: null,
      organizationName: ownerIsNgo ? dto.owner.name : null,
    },
    adopter: { userId: dto.adopter.id, name: dto.adopter.name, photoUrl: null, city: null, state: null },
  }
}

// Pedidos de demonstração do admin (adminDemoData, só em dev): continuam no
// localStorage, marcados com `adminDemo`, para os gráficos terem volume
function readDemoRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADOPTION_REQUESTS_STORAGE_KEY))
    return Array.isArray(stored) ? stored.filter((request) => request.adminDemo) : []
  } catch {
    return []
  }
}

// Todos os pedidos da plataforma
async function loadRequests() {
  const real = await adocaoApi.listAllForAdmin()
  return [...real.map(toStatsRequest), ...readDemoRequests()]
}

// A vitrine pública só lista disponíveis, de página em página
async function fetchAvailableAnimals() {
  const animals = []
  for (let page = 0; ; page += 1) {
    const data = await animaisApi.listAnimals({ page, size: ANIMALS_PAGE_SIZE })
    animals.push(...data.content)
    if (page + 1 >= data.totalPages) return animals
  }
}

// Pedido real é de animal da API; os de demonstração dizem na cópia (são
// de animais fictícios, que não existem na API)
function sourceOf(request) {
  return request.animalSource ?? request.animal?.source ?? 'legacy'
}

// Animais da API que a vitrine não mostra mais por terem sido adotados: só
// a cópia guardada no pedido concluído sabe quem eram
function adoptedFromRequests(requests, availableById) {
  const adopted = new Map()
  for (const request of requests) {
    const snapshot = request.animal
    const key = String(request.animalId)
    if (request.status !== 'CONCLUDED' || !snapshot || availableById.has(key) || adopted.has(key)) continue
    if (sourceOf(request) !== 'api') continue

    adopted.set(key, {
      id: request.animalId,
      name: snapshot.name,
      species: snapshot.species,
      coverPhoto: snapshot.photoUrl,
      status: 'ADOPTED',
      city: null,
      state: null,
      createdAt: null,
      owner: {
        id: request.ownerId,
        name: snapshot.ownerName,
        photoUrl: snapshot.ownerPhotoUrl,
        userType: snapshot.organizationName ? 'NGO' : 'PERSON',
        isVerified: Boolean(snapshot.organizationName),
      },
    })
  }
  return [...adopted.values()]
}

// Tudo o que o admin enxerga de animais + a situação de cada um ("em
// processo" e "adotado" também dependem dos pedidos, como no painel da ONG)
async function loadAnimals(requests) {
  // Removido pelo admin: a API ainda lista, o "banco" de moderação sabe
  const available = (await fetchAvailableAnimals()).map((dto) =>
    isAnimalRemoved(dto) ? { ...dto, status: 'REMOVED' } : dto
  )
  const availableById = new Map(available.map((dto) => [String(dto.id), dto]))
  const animals = [...available, ...adoptedFromRequests(requests, availableById)]

  const withStatus = withAdoptionStatus(
    animals.map((dto) => ({ id: dto.id, ownerId: dto.owner?.id ?? null, status: dto.status })),
    requests.map((request) => ({ ...request, animalSource: sourceOf(request) }))
  )
  const listingStatus = new Map(withStatus.map((animal) => [String(animal.id), animal.listingStatus]))

  return animals.map((dto) => ({ dto, listingStatus: listingStatus.get(String(dto.id)) }))
}

function definedFields(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value != null))
}

// Contas do banco falso + as contas que aparecem nos dados de verdade: ONGs
// de campanhas e eventos, quem pediu para adotar e, por último (a fonte mais
// confiável), donos dos animais da API. Os ids do seed (1 a 7) se repetem
// com os do banco real: mesmo id com outro nome é outra conta, e a de
// verdade ocupa o lugar da fictícia. Com o mesmo nome, só completa os dados
function loadAccounts(animals, campaigns, events, requests) {
  const byId = new Map(store.read().accounts.map((account) => [String(account.id), account]))

  function see(account) {
    const key = String(account.id)
    const current = byId.get(key)
    if (!current || current.name !== account.name) {
      byId.set(key, { email: null, createdAt: null, active: true, city: null, state: null, ...account })
    } else {
      byId.set(key, { ...current, ...definedFields(account) })
    }
  }

  for (const { ngo } of [...campaigns, ...events]) {
    if (!ngo) continue
    see({
      id: ngo.id,
      name: ngo.name,
      userType: 'NGO',
      photoUrl: ngo.photoUrl ?? null,
      city: ngo.city,
      state: ngo.state,
      isVerified: Boolean(ngo.isVerified),
    })
  }
  // Quem só adota não anuncia nada: sem isto, não teria como ser moderado
  for (const { adopter } of requests) {
    if (adopter?.userId == null) continue
    see({
      id: adopter.userId,
      name: adopter.name,
      userType: 'PERSON',
      photoUrl: adopter.photoUrl ?? null,
      city: adopter.city ?? null,
      state: adopter.state ?? null,
      isVerified: false,
    })
  }
  for (const { dto } of animals) {
    if (!dto.owner) continue
    see({
      id: dto.owner.id,
      name: dto.owner.name,
      userType: dto.owner.userType,
      photoUrl: dto.owner.photoUrl ?? null,
      city: dto.city,
      state: dto.state,
      isVerified: Boolean(dto.owner.isVerified),
    })
  }
  // Banida = `users.active = false` no backend; aqui vem do moderationMock
  return [...byId.values()].map((account) => ({ ...account, active: !isAccountBanned(account) }))
}

function toUserDto(account, animals) {
  return {
    ...account,
    animalsCount: animals.filter(({ dto }) => isSameId(dto.owner?.id, account.id)).length,
  }
}

// '2026-05', '2026-06'... até o mês atual
function lastMonthKeys(count) {
  const today = new Date()
  return Array.from({ length: count }, (_, index) =>
    toLocalIsoDate(new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1)).slice(0, 7)
  )
}

function monthOf(isoDate) {
  return isoDate ? isoDate.slice(0, 7) : null
}

function countBy(items, predicate) {
  return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0)
}

function usersStats(accounts, months) {
  return {
    total: accounts.length,
    persons: countBy(accounts, (account) => account.userType === 'PERSON'),
    ngos: countBy(accounts, (account) => account.userType === 'NGO'),
    newByMonth: months.map((month) => {
      const created = accounts.filter((account) => monthOf(account.createdAt) === month)
      return {
        month,
        persons: countBy(created, (account) => account.userType === 'PERSON'),
        ngos: countBy(created, (account) => account.userType === 'NGO'),
      }
    }),
  }
}

// Anúncio de conta banida não conta como disponível nem em processo: o site
// não o mostra mais. Os adotados continuam como histórico
function animalsStats(animals) {
  const onSite = animals.filter(({ dto }) => !isAccountBanned(dto.owner))
  const visible = onSite.filter(({ listingStatus }) => listingStatus !== 'INACTIVE' && listingStatus !== 'REMOVED')
  return {
    available: countBy(onSite, ({ listingStatus }) => listingStatus === 'AVAILABLE'),
    inProgress: countBy(onSite, ({ listingStatus }) => listingStatus === 'IN_PROGRESS'),
    adopted: countBy(animals, ({ listingStatus }) => listingStatus === 'ADOPTED'),
    removed: countBy(animals, ({ listingStatus }) => listingStatus === 'REMOVED'),
    bySpecies: {
      DOG: countBy(visible, ({ dto }) => dto.species === 'DOG'),
      CAT: countBy(visible, ({ dto }) => dto.species === 'CAT'),
      OTHER: countBy(visible, ({ dto }) => dto.species !== 'DOG' && dto.species !== 'CAT'),
    },
  }
}

// Todos os pedidos da plataforma, de animais da API e do AUmatch
function adoptionsStats(requests, months) {
  const concluded = requests.filter((request) => request.status === 'CONCLUDED')
  return {
    funnel: {
      received: requests.length,
      accepted: countBy(requests, (request) => ACCEPTED_OR_LATER.includes(request.status)),
      delivery: countBy(requests, (request) => DELIVERY_OR_LATER.includes(request.status)),
      concluded: concluded.length,
    },
    concludedByMonth: months.map((month) => ({
      month,
      count: countBy(concluded, (request) => monthOf(request.concludedAt ?? request.createdAt) === month),
    })),
  }
}

function donationsStats(donations, months) {
  return {
    totalRaised: donations.reduce((sum, donation) => sum + donation.amount, 0),
    approvedCount: donations.length,
    raisedByMonth: months.map((month) => {
      const inMonth = donations.filter((donation) => monthOf(donation.approvedAt) === month)
      return { month, amount: inMonth.reduce((sum, donation) => sum + donation.amount, 0), count: inMonth.length }
    }),
  }
}

// Ranking das ONGs: arrecadado (doações aprovadas) e adoções concluídas
// de animais delas. O nome vem do próprio dado (campanha ou cópia do
// animal no pedido), que é de quem de fato arrecadou ou doou o animal
function ngoRanking(accounts, requests, donations) {
  const byId = new Map()
  function entry(id, name) {
    const key = String(id)
    if (!byId.has(key)) {
      const account = accounts.find((item) => isSameId(item.id, id))
      byId.set(key, { id, name: name ?? account?.name ?? '', raised: 0, adoptions: 0 })
    }
    return byId.get(key)
  }

  for (const donation of donations) {
    if (donation.ngo) entry(donation.ngo.id, donation.ngo.name).raised += donation.amount
  }
  for (const request of requests) {
    if (request.status !== 'CONCLUDED') continue
    const owner = accounts.find((account) => isSameId(account.id, request.ownerId))
    const isNgo = request.animal?.organizationName ? true : owner?.userType === 'NGO'
    if (isNgo) entry(request.ownerId, request.animal?.organizationName ?? request.animal?.ownerName).adoptions += 1
  }

  const ngos = [...byId.values()]
  return {
    byRaised: ngos.filter((ngo) => ngo.raised > 0).sort((a, b) => b.raised - a.raised).slice(0, RANKING_LIMIT),
    byAdoptions: ngos
      .filter((ngo) => ngo.adoptions > 0)
      .sort((a, b) => b.adoptions - a.adoptions)
      .slice(0, RANKING_LIMIT),
  }
}

function isListedCampaign(campaign) {
  return !campaign.removed && !isAccountBanned(campaign.ngo)
}

function isListedEvent(event) {
  return event.status === 'ACTIVE' && !isAccountBanned(event.ngo)
}

// `active` do dono (animal) ou da ONG (campanha, evento): o admin vê o
// conteúdo de conta banida, que o site não mostra mais
function withOwnerStatus(dto, field) {
  return dto[field] ? { ...dto, [field]: { ...dto[field], active: !isAccountBanned(dto[field]) } } : dto
}

// Denúncia que envolve a conta: contra o perfil dela ou contra um anúncio dela
function involvesAccount(report, account) {
  if (report.targetType === 'USER') return matchesAccount(account, { id: report.targetId, name: report.target.name })
  return matchesAccount(account, { id: report.target.ownerId, name: report.target.ownerName })
}

function banAndResolve(account) {
  banAccount(account)
  return resolvePendingReportsForAdmin((report) => involvesAccount(report, account), 'ACCOUNT_BANNED')
}

// Pendentes: quantas denúncias e quantos alvos ("casos") esperam o admin
function reportsStats(reports) {
  const pending = reports.filter((report) => report.status === 'PENDING')
  return { pending: pending.length, pendingTargets: new Set(pending.map(reportTargetKey)).size }
}

// O que aconteceu por último na plataforma (o `id` é do que foi criado:
// conta, animal adotado, campanha ou evento)
function recentActivity(accounts, requests, campaigns, events) {
  return [
    ...accounts
      .filter((account) => account.createdAt)
      .map((account) => ({
        type: 'ACCOUNT_CREATED',
        at: account.createdAt,
        id: account.id,
        title: account.name,
        detail: account.userType,
      })),
    ...requests
      .filter((request) => request.status === 'CONCLUDED')
      .map((request) => ({
        type: 'ADOPTION_CONCLUDED',
        at: request.concludedAt ?? request.createdAt,
        id: request.animalId,
        title: request.animal?.name ?? null,
        detail: request.adopter?.name ?? null,
      })),
    ...campaigns
      .filter((campaign) => !campaign.removed)
      .map((campaign) => ({
        type: 'CAMPAIGN_CREATED',
        at: campaign.createdAt,
        id: campaign.id,
        title: campaign.title,
        detail: campaign.ngo?.name ?? null,
      })),
    ...events
      .filter((event) => event.createdAt)
      .map((event) => ({
        type: 'EVENT_CREATED',
        at: event.createdAt,
        id: event.id,
        title: event.title,
        detail: event.ngo?.name ?? null,
      })),
  ]
    .filter((item) => item.at)
    .sort(byNewest('at'))
    .slice(0, RECENT_ACTIVITY_LIMIT)
}

// ---------- rotas ----------

// GET /api/admin/stats — números e séries da Visão geral (e do PDF)
export async function getStats() {
  await mockDelay()
  requireAdmin()

  const requests = await loadRequests()
  const animals = await loadAnimals(requests)
  const donations = readApprovedDonationsForAdmin()
  const campaigns = readAllCampaignsForAdmin()
  const events = readAllEventsForAdmin()
  const accounts = loadAccounts(animals, campaigns, events, requests)
  const today = todayLocalIso()
  const months = lastMonthKeys(SERIES_MONTHS)

  return {
    users: usersStats(accounts, months),
    animals: animalsStats(animals),
    adoptions: adoptionsStats(requests, months),
    donations: donationsStats(donations, months),
    // `suspended`: de ONG banida (some do site, mas o dinheiro arrecadado fica)
    campaigns: {
      active: countBy(campaigns, (campaign) => isListedCampaign(campaign) && campaign.status === 'ACTIVE'),
      closed: countBy(campaigns, (campaign) => isListedCampaign(campaign) && campaign.status === 'CLOSED'),
      removed: countBy(campaigns, (campaign) => campaign.removed),
      suspended: countBy(campaigns, (campaign) => !campaign.removed && isAccountBanned(campaign.ngo)),
    },
    events: {
      upcoming: countBy(events, (event) => isListedEvent(event) && event.date >= today),
      past: countBy(events, (event) => isListedEvent(event) && event.date < today),
      cancelled: countBy(events, (event) => event.status === 'CANCELLED'),
      suspended: countBy(events, (event) => event.status === 'ACTIVE' && isAccountBanned(event.ngo)),
    },
    ngoRanking: ngoRanking(accounts, requests, donations),
    recentActivity: recentActivity(accounts, requests, campaigns, events),
    reports: reportsStats(readAllReportsForAdmin()),
  }
}

// GET /api/admin/users — pessoas e ONGs (sem admins), mais recentes primeiro
export async function listUsers() {
  await mockDelay()
  requireAdmin()

  const requests = await loadRequests()
  const animals = await loadAnimals(requests)
  return loadAccounts(animals, readAllCampaignsForAdmin(), readAllEventsForAdmin(), requests)
    .sort(byNewest('createdAt'))
    .map((account) => toUserDto(account, animals))
}

// GET /api/admin/animals — todos os anúncios que o admin consegue enxergar
export async function listAnimals() {
  await mockDelay()
  requireAdmin()

  const animals = await loadAnimals(await loadRequests())
  // `listingStatus`: a situação do anúncio, que também depende dos pedidos
  // ("em processo", adotado) — calculada aqui, como a API do admin fará
  return animals
    .map(({ dto, listingStatus }) => ({ ...withOwnerStatus(dto, 'owner'), listingStatus }))
    .sort(byNewest('createdAt'))
}

// GET /api/admin/campaigns — ativas, encerradas e excluídas (`removed`)
export async function listCampaigns() {
  await mockDelay()
  requireAdmin()
  return readAllCampaignsForAdmin().map((dto) => withOwnerStatus(dto, 'ngo'))
}

// GET /api/admin/events — próximos, passados e cancelados
export async function listEvents() {
  await mockDelay()
  requireAdmin()
  return readAllEventsForAdmin().map((dto) => withOwnerStatus(dto, 'ngo'))
}

// GET /api/admin/reports — todas as denúncias, com quem denunciou
export async function listReports() {
  await mockDelay()
  requireAdmin()
  return readAllReportsForAdmin()
}

// POST /api/admin/reports/{id}/dismiss — arquiva (improcedente) esta denúncia
// e as outras pendentes do mesmo alvo; devolve as que foram arquivadas
export async function dismissReports(reportId) {
  await mockDelay()
  requireAdmin()

  const report = findReportForAdmin(reportId)
  if (!report) throw mockHttpError(404, 'Denúncia não encontrada.')
  if (report.status !== 'PENDING') throw mockHttpError(400, 'Esta denúncia já foi julgada.')

  const key = reportTargetKey(report)
  return resolvePendingReportsForAdmin((row) => reportTargetKey(row) === key, 'DISMISSED')
}

// POST /api/admin/reports/{id}/ban — bane a conta denunciada (perfil) ou a
// dona do anúncio denunciado; resolve as pendentes contra ela e os anúncios dela
export async function banReportedAccount(reportId) {
  await mockDelay()
  requireAdmin()

  const report = findReportForAdmin(reportId)
  if (!report) throw mockHttpError(404, 'Denúncia não encontrada.')
  if (report.status !== 'PENDING') throw mockHttpError(400, 'Esta denúncia já foi julgada.')

  const isProfile = report.targetType === 'USER'
  const account = isProfile
    ? { id: report.targetId, name: report.target.name, userType: report.target.userType }
    : { id: report.target.ownerId, name: report.target.ownerName, userType: report.target.ownerUserType }
  if (account.id == null) throw mockHttpError(400, 'Não foi possível identificar a conta denunciada.')

  return banAndResolve(account)
}

// PATCH /api/admin/users/{id}/status { active } — banir (false) ou reativar
// (true). Banir também resolve as denúncias pendentes contra a conta e os
// anúncios dela; os pedidos de adoção ativos aparecem cancelados (no mock,
// pela camada de moderação do AdoptionRequestProvider — o servidor não muda)
export async function setUserStatus(userId, active) {
  await mockDelay()
  requireAdmin()
  if (typeof active !== 'boolean') throw mockHttpError(400, 'Informe se a conta fica ativa.')

  const requests = await loadRequests()
  const animals = await loadAnimals(requests)
  const accounts = loadAccounts(animals, readAllCampaignsForAdmin(), readAllEventsForAdmin(), requests)
  const account = accounts.find((item) => isSameId(item.id, userId))
  if (!account) throw mockHttpError(404, 'Conta não encontrada.')

  if (active) reactivateAccount(account)
  else banAndResolve(account)
  return toUserDto({ ...account, active }, animals)
}

// DELETE /api/admin/animals/{id} — tira o anúncio do site de vez (o dono vê
// "Removido pela moderação" e não reativa) e resolve as denúncias pendentes
// contra ele. Os pedidos ativos do animal aparecem cancelados (no mock,
// pela camada de moderação do AdoptionRequestProvider)
export async function removeAnimal(animalId) {
  await mockDelay()
  requireAdmin()

  const animals = await loadAnimals(await loadRequests())
  const found = animals.find(({ dto }) => isSameId(dto.id, animalId))
  if (!found) throw mockHttpError(404, 'Anúncio não encontrado.')
  if (found.listingStatus === 'REMOVED') throw mockHttpError(400, 'Este anúncio já foi removido.')
  if (found.listingStatus === 'ADOPTED') {
    throw mockHttpError(400, 'Este animal já foi adotado: o anúncio fica só como histórico.')
  }

  removeAnimalListing({ id: found.dto.id, ownerId: found.dto.owner?.id, name: found.dto.name })
  resolvePendingReportsForAdmin(
    (report) => report.targetType === 'ANIMAL' && isSameId(report.targetId, animalId),
    'LISTING_REMOVED'
  )
}

// DELETE /api/admin/campaigns/{id} — sai do site e para de receber doações
export async function removeCampaign(campaignId) {
  await mockDelay()
  requireAdmin()
  removeCampaignForAdmin(campaignId)
}

// DELETE /api/admin/events/{id} — vira cancelado para quem tinha confirmado
export async function removeEvent(eventId) {
  await mockDelay()
  requireAdmin()
  removeEventForAdmin(eventId)
}

// ---------- só do mock: dados de teste do painel do admin (features/admin/dev) ----------

// Contas de teste, marcadas com `adminDemo` para removeDemoAccounts apagar só elas
export async function insertDemoAccounts(templates) {
  await mockDelay()
  requireAdmin()
  const db = store.read()

  let id = nextId(db.accounts)
  const accounts = templates.map((template) => ({ ...template, id: id++, active: true, adminDemo: true }))
  store.write({ ...db, accounts: [...db.accounts, ...accounts] })
}

export async function removeDemoAccounts() {
  await mockDelay()
  const db = store.read()
  store.write({ ...db, accounts: db.accounts.filter((account) => !account.adminDemo) })
}
