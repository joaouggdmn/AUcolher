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
import { adoptionRequestsSeed } from '../../adocao/data/adoptionRequestsSeed'
import { requestAnimalSource } from '../../adocao/utils/requestAnimal'
import * as animaisApi from '../../animais/services/animaisApi'
import { withAdoptionStatus } from '../../animais/utils/listingStatus'
import { readAllCampaignsForAdmin, readApprovedDonationsForAdmin } from '../../doacoes/services/doacoesMock'
import {
  findReportForAdmin,
  readAllReportsForAdmin,
  resolvePendingReportsForAdmin,
} from '../../denuncias/services/denunciasMock'
import { reportTargetKey } from '../../denuncias/utils/reportRules'
import { readAllEventsForAdmin } from '../../eventos/services/eventosMock'
import { buildSeedAdmin } from '../data/seedAdmin'

// 🔴 Servidor falso do painel do admin: mesmas funções de adminApi.js e os
// DTOs de docs/api-admin.md. A API ainda não lista contas, então elas vivem
// aqui (seedAdmin.js); o resto vem de onde já mora hoje:
//   animais  → API real (GET /api/animals, só os disponíveis) + adotados
//              tirados da cópia guardada nos pedidos
//   pedidos  → localStorage do AdoptionRequestProvider
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

// O mesmo "banco" que o AdoptionRequestProvider grava (todas as contas)
function readRequests() {
  try {
    const stored = localStorage.getItem(ADOPTION_REQUESTS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // payload corrompido — cai para o seed, como o provider
  }
  return adoptionRequestsSeed
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

// Mesmo critério do AdoptionRequestProvider: o pedido é de um animal da API
// quando a cópia diz isso ou quando o animal da API com esse id é do mesmo dono
function sourceOf(request, availableById) {
  const apiAnimal = availableById.get(String(request.animalId))
  return requestAnimalSource(request, apiAnimal && { ownerId: apiAnimal.owner?.id })
}

// Animais da API que a vitrine não mostra mais por terem sido adotados: só
// a cópia guardada no pedido concluído sabe quem eram
function adoptedFromRequests(requests, availableById) {
  const adopted = new Map()
  for (const request of requests) {
    const snapshot = request.animal
    const key = String(request.animalId)
    if (request.status !== 'CONCLUDED' || !snapshot || availableById.has(key) || adopted.has(key)) continue
    if (sourceOf(request, availableById) !== 'api') continue

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
  const available = await fetchAvailableAnimals()
  const availableById = new Map(available.map((dto) => [String(dto.id), dto]))
  const animals = [...available, ...adoptedFromRequests(requests, availableById)]

  const withStatus = withAdoptionStatus(
    animals.map((dto) => ({ id: dto.id, ownerId: dto.owner?.id ?? null, status: dto.status })),
    requests.map((request) => ({ ...request, animalSource: sourceOf(request, availableById) }))
  )
  const listingStatus = new Map(withStatus.map((animal) => [String(animal.id), animal.listingStatus]))

  return animals.map((dto) => ({ dto, listingStatus: listingStatus.get(String(dto.id)) }))
}

function definedFields(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value != null))
}

// Contas do banco falso + as contas que aparecem nos dados de verdade: ONGs
// de campanhas e eventos e, por último (a fonte mais confiável), donos dos
// animais da API. Os ids do seed (1 a 7) se repetem com os do banco real:
// mesmo id com outro nome é outra conta, e a de verdade ocupa o lugar da
// fictícia. Com o mesmo nome, só completa os dados
function loadAccounts(animals, campaigns, events) {
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
  return [...byId.values()]
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

function animalsStats(animals) {
  const visible = animals.filter(({ listingStatus }) => listingStatus !== 'INACTIVE')
  return {
    available: countBy(animals, ({ listingStatus }) => listingStatus === 'AVAILABLE'),
    inProgress: countBy(animals, ({ listingStatus }) => listingStatus === 'IN_PROGRESS'),
    adopted: countBy(animals, ({ listingStatus }) => listingStatus === 'ADOPTED'),
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

  const requests = readRequests()
  const animals = await loadAnimals(requests)
  const donations = readApprovedDonationsForAdmin()
  const campaigns = readAllCampaignsForAdmin()
  const events = readAllEventsForAdmin()
  const accounts = loadAccounts(animals, campaigns, events)
  const today = todayLocalIso()
  const months = lastMonthKeys(SERIES_MONTHS)

  return {
    users: usersStats(accounts, months),
    animals: animalsStats(animals),
    adoptions: adoptionsStats(requests, months),
    donations: donationsStats(donations, months),
    campaigns: {
      active: countBy(campaigns, (campaign) => !campaign.removed && campaign.status === 'ACTIVE'),
      closed: countBy(campaigns, (campaign) => !campaign.removed && campaign.status === 'CLOSED'),
      removed: countBy(campaigns, (campaign) => campaign.removed),
    },
    events: {
      upcoming: countBy(events, (event) => event.status === 'ACTIVE' && event.date >= today),
      past: countBy(events, (event) => event.status === 'ACTIVE' && event.date < today),
      cancelled: countBy(events, (event) => event.status === 'CANCELLED'),
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

  const animals = await loadAnimals(readRequests())
  return loadAccounts(animals, readAllCampaignsForAdmin(), readAllEventsForAdmin())
    .sort(byNewest('createdAt'))
    .map((account) => toUserDto(account, animals))
}

// GET /api/admin/animals — todos os anúncios que o admin consegue enxergar
export async function listAnimals() {
  await mockDelay()
  requireAdmin()

  const animals = await loadAnimals(readRequests())
  return animals.map(({ dto }) => dto).sort(byNewest('createdAt'))
}

// GET /api/admin/campaigns — ativas, encerradas e excluídas (`removed`)
export async function listCampaigns() {
  await mockDelay()
  requireAdmin()
  return readAllCampaignsForAdmin()
}

// GET /api/admin/events — próximos, passados e cancelados
export async function listEvents() {
  await mockDelay()
  requireAdmin()
  return readAllEventsForAdmin()
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
