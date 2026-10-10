import {
  createMockStore,
  getMockSession,
  httpUrlOrNull,
  isSameId,
  mockDelay,
  mockHttpError,
  nextId,
} from '../../../core/services/mock/mockStore'
import { MOCK_CAMPANHAS_STORE_KEY } from '../../../core/utils/storageKeys'
import { PIX_EXPIRATION_MINUTES } from '../../../core/utils/constants'
import { addMinutesLocalIso, nowLocalIso, todayLocalIso } from '../../../core/utils/localDate'
import { buildSeedCampanhas } from '../data/seedCampanhas'
import { getCampaignPayloadErrors, getDonationAmountError } from '../utils/campanhaRules'

// 🔴 Servidor falso de campanhas e doações: mesmas funções de doacoesApi.js
// e mesmas regras, DTOs e erros do contrato (docs/api-campanhas-eventos.md).
// Faz o papel do backend E do Mercado Pago: gera um PIX fictício e só
// aprova pelo botão "Simular pagamento" (simulateDonationApproval)
const store = createMockStore({ key: MOCK_CAMPANHAS_STORE_KEY, version: 1, seed: buildSeedCampanhas })

const PAYLOAD_FIELDS = ['title', 'description', 'category', 'isUrgent', 'goalAmount', 'deadline', 'coverUrl']

// ---------- helpers do "backend" ----------

// Prazo vencido encerra a campanha sem ninguém gravar nada: o status é
// calculado na leitura, como o backend fará
function isClosed(row) {
  return row.status === 'CLOSED' || (row.deadline != null && row.deadline < todayLocalIso())
}

function approvedDonations(db, campaignId) {
  return db.donations.filter((donation) => isSameId(donation.campaign.id, campaignId) && donation.status === 'APPROVED')
}

// Arrecadado e total de doações são um SUM/COUNT das aprovadas
function toCampaignDto(db, row) {
  const approved = approvedDonations(db, row.id)
  const closedByDeadline = row.status !== 'CLOSED' && isClosed(row)

  // `deleted` é coluna interna: nunca sai na resposta
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    isUrgent: row.isUrgent,
    goalAmount: row.goalAmount,
    coverUrl: row.coverUrl,
    deadline: row.deadline,
    createdAt: row.createdAt,
    ngo: row.ngo,
    raisedAmount: approved.reduce((sum, donation) => sum + donation.amount, 0),
    donationsCount: approved.length,
    status: isClosed(row) ? 'CLOSED' : 'ACTIVE',
    closedAt: closedByDeadline ? `${row.deadline}T23:59:59` : row.closedAt,
  }
}

// `withPix` só para o próprio doador; `withDonor` só para a ONG que recebeu
function toDonationDto(db, row, { withPix = false, withDonor = false } = {}) {
  const campaign = db.campaigns.find((item) => isSameId(item.id, row.campaign.id))

  return {
    id: row.id,
    amount: row.amount,
    status: row.status,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
    pix: withPix && row.status === 'PENDING' ? { ...row.pix, expiresAt: row.expiresAt } : null,
    // Título e ONG atuais; a cópia guardada na doação só vale se a campanha
    // foi apagada de vez
    campaign: {
      id: row.campaign.id,
      title: campaign?.title ?? row.campaign.title,
      ngoName: campaign?.ngo.name ?? row.campaign.ngoName,
      removed: !campaign || campaign.deleted,
    },
    donor: withDonor ? row.donor : null,
  }
}

function byNewest(field) {
  return (a, b) => (b[field] ?? '').localeCompare(a[field] ?? '')
}

function requireSession() {
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  return user
}

function requireOng(user) {
  if (user.userType !== 'ONG') throw mockHttpError(403, 'Apenas contas de ONG podem gerenciar campanhas.')
}

function requireOwner(row, user) {
  if (!isSameId(row.ngo.id, user.id)) throw mockHttpError(403, 'Só a ONG que criou a campanha pode fazer isso.')
}

// Excluída (lógica ou real) não existe mais para as rotas de campanha
function findCampaignRow(db, id) {
  const row = db.campaigns.find((campaign) => isSameId(campaign.id, id))
  if (!row || row.deleted) throw mockHttpError(404, 'Campanha não encontrada.')
  return row
}

// PIX pendente vence em 30 min. Sem job agendado: quem lê marca como
// expirado — o backend real faz o mesmo ao consultar o Mercado Pago
function withExpiredDonations(db) {
  const now = nowLocalIso()
  const hasExpired = db.donations.some((donation) => donation.status === 'PENDING' && donation.expiresAt < now)
  if (!hasExpired) return db

  const next = {
    ...db,
    donations: db.donations.map((donation) =>
      donation.status === 'PENDING' && donation.expiresAt < now ? { ...donation, status: 'EXPIRED' } : donation
    ),
  }
  store.write(next)
  return next
}

// Encerrar ou excluir derruba os PIX que ainda não foram pagos
function cancelPendingDonations(donations, campaignId) {
  return donations.map((donation) =>
    isSameId(donation.campaign.id, campaignId) && donation.status === 'PENDING'
      ? { ...donation, status: 'CANCELLED' }
      : donation
  )
}

// Igual ao Sanitizer do backend: texto aparado, vazio vira null
function normalizePayload(payload = {}) {
  const normalized = Object.fromEntries(
    PAYLOAD_FIELDS.map((field) => {
      const value = payload[field]
      if (typeof value !== 'string') return [field, value ?? null]
      const trimmed = value.trim()
      return [field, trimmed === '' ? null : trimmed]
    })
  )
  normalized.isUrgent = Boolean(normalized.isUrgent)
  return normalized
}

function validate(payload) {
  const [firstError] = Object.values(getCampaignPayloadErrors(payload, todayLocalIso()))
  if (firstError) throw mockHttpError(400, firstError)
}

function ngoSnapshot(user) {
  return {
    id: user.id,
    name: user.name,
    isVerified: Boolean(user.isVerified),
    photoUrl: httpUrlOrNull(user.photoUrl),
    city: user.address?.city || user.city || null,
    state: user.address?.state || user.state || null,
  }
}

function userSnapshot(user) {
  return { id: user.id, name: user.name, photoUrl: httpUrlOrNull(user.photoUrl) }
}

// ---------- PIX fictício ----------

// CRC16-CCITT, o mesmo dígito verificador do "copia e cola" de verdade
function crc16(text) {
  let crc = 0xffff
  for (let i = 0; i < text.length; i += 1) {
    crc ^= text.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function emvField(id, value) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

// Código no formato EMV do PIX, com chave e recebedor de teste: o QR é
// desenhado igual ao real, mas nenhum banco aceita pagar
function buildFakePixCode(donationId, amount) {
  const payload =
    emvField('00', '01') +
    emvField('26', emvField('00', 'br.gov.bcb.pix') + emvField('01', 'pix-teste@aucolher.dev')) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', amount.toFixed(2)) +
    emvField('58', 'BR') +
    emvField('59', 'AUCOLHER MODO TESTE') +
    emvField('60', 'CRICIUMA') +
    emvField('62', emvField('05', `AUCOLHERMOCK${donationId}`)) +
    '6304'
  return payload + crc16(payload)
}

// ---------- rotas: campanhas ----------

// GET /api/campaigns?ngoId=&status= — padrão ACTIVE; excluídas nunca aparecem
export async function listCampaigns({ ngoId, status = 'ACTIVE' } = {}) {
  await mockDelay()
  const db = store.read()

  return db.campaigns
    .filter((row) => !row.deleted && (isClosed(row) ? 'CLOSED' : 'ACTIVE') === status)
    .filter((row) => ngoId == null || isSameId(row.ngo.id, ngoId))
    .sort(byNewest('createdAt'))
    .map((row) => toCampaignDto(db, row))
}

// GET /api/campaigns/{id} — encerrada abre normalmente (somente leitura)
export async function getCampaign(id) {
  await mockDelay()
  const db = store.read()
  return toCampaignDto(db, findCampaignRow(db, id))
}

// POST /api/campaigns
export async function createCampaign(payload) {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const fields = normalizePayload(payload)
  validate(fields)

  const db = store.read()
  const row = {
    id: nextId(db.campaigns),
    ...fields,
    status: 'ACTIVE',
    createdAt: nowLocalIso(),
    closedAt: null,
    deleted: false,
    ngo: ngoSnapshot(user),
  }
  store.write({ ...db, campaigns: [...db.campaigns, row] })
  return toCampaignDto(db, row)
}

// PUT /api/campaigns/{id}
export async function updateCampaign(id, payload) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findCampaignRow(db, id)
  requireOwner(row, user)
  if (isClosed(row)) throw mockHttpError(400, 'Campanhas encerradas não podem ser editadas.')

  const fields = normalizePayload(payload)
  validate(fields)

  const updated = { ...row, ...fields, ngo: ngoSnapshot(user) }
  store.write({ ...db, campaigns: db.campaigns.map((campaign) => (campaign.id === row.id ? updated : campaign)) })
  return toCampaignDto(db, updated)
}

// POST /api/campaigns/{id}/close — cancela os PIX pendentes
export async function closeCampaign(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findCampaignRow(db, id)
  requireOwner(row, user)
  if (isClosed(row)) throw mockHttpError(400, 'Esta campanha já está encerrada.')

  const closed = { ...row, status: 'CLOSED', closedAt: nowLocalIso() }
  const next = {
    ...db,
    campaigns: db.campaigns.map((campaign) => (campaign.id === row.id ? closed : campaign)),
    donations: cancelPendingDonations(db.donations, row.id),
  }
  store.write(next)
  return toCampaignDto(next, closed)
}

// DELETE /api/campaigns/{id} — sem doações aprovadas some de vez; com
// doações vira exclusão lógica (o histórico do doador e o pagamento ficam)
export async function deleteCampaign(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findCampaignRow(db, id)
  requireOwner(row, user)

  const donations = cancelPendingDonations(db.donations, row.id)
  const campaigns =
    approvedDonations(db, row.id).length === 0
      ? db.campaigns.filter((campaign) => campaign.id !== row.id)
      : db.campaigns.map((campaign) => (campaign.id === row.id ? { ...campaign, deleted: true } : campaign))
  store.write({ ...db, campaigns, donations })
}

// GET /api/campaigns/mine — ativas e encerradas da ONG logada
export async function listMyCampaigns() {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()

  return db.campaigns
    .filter((row) => !row.deleted && isSameId(row.ngo.id, user.id))
    .sort(byNewest('createdAt'))
    .map((row) => toCampaignDto(db, row))
}

// ---------- rotas: doações ----------

// POST /api/campaigns/{id}/donations { amount } — 201 com o PIX
export async function createDonation(campaignId, { amount } = {}) {
  await mockDelay(600)
  const user = requireSession()
  const db = store.read()
  const row = findCampaignRow(db, campaignId)

  if (isSameId(row.ngo.id, user.id)) throw mockHttpError(400, 'Você não pode doar para a sua própria campanha.')
  if (isClosed(row)) throw mockHttpError(400, 'Esta campanha está encerrada e não recebe mais doações.')
  const amountError = getDonationAmountError(amount)
  if (amountError) throw mockHttpError(400, amountError)

  const id = nextId(db.donations)
  const createdAt = nowLocalIso()
  const donation = {
    id,
    amount,
    status: 'PENDING',
    createdAt,
    approvedAt: null,
    expiresAt: addMinutesLocalIso(createdAt, PIX_EXPIRATION_MINUTES),
    pix: { qrCode: buildFakePixCode(id, amount), qrCodeBase64: '', ticketUrl: null },
    donor: userSnapshot(user),
    campaign: { id: row.id, title: row.title, ngoName: row.ngo.name },
  }
  const next = { ...db, donations: [...db.donations, donation] }
  store.write(next)
  return toDonationDto(next, donation, { withPix: true })
}

// GET /api/donations/{id} — só o doador; é o que o modal consulta a cada 3 s
export async function getDonation(id) {
  await mockDelay(150)
  const user = requireSession()
  const db = withExpiredDonations(store.read())
  const row = db.donations.find((donation) => isSameId(donation.id, id))
  if (!row) throw mockHttpError(404, 'Doação não encontrada.')
  if (!isSameId(row.donor.id, user.id)) throw mockHttpError(403, 'Esta doação é de outra conta.')
  return toDonationDto(db, row, { withPix: true })
}

// GET /api/donations/mine — histórico de quem doou, em qualquer status
export async function listMyDonations() {
  await mockDelay()
  const user = requireSession()
  const db = withExpiredDonations(store.read())

  return db.donations
    .filter((donation) => isSameId(donation.donor.id, user.id))
    .sort(byNewest('createdAt'))
    .map((donation) => toDonationDto(db, donation))
}

// GET /api/donations/received — aprovadas nas campanhas da ONG logada
export async function listReceivedDonations() {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()
  const myCampaignIds = db.campaigns.filter((row) => isSameId(row.ngo.id, user.id)).map((row) => row.id)

  return db.donations
    .filter((donation) => donation.status === 'APPROVED' && myCampaignIds.includes(donation.campaign.id))
    .sort(byNewest('approvedAt'))
    .map((donation) => toDonationDto(db, donation, { withDonor: true }))
}

// ---------- só do mock ----------

// Faz o papel do webhook do Mercado Pago. Pagamento que chega depois de a
// campanha ser encerrada/excluída é aprovado mesmo assim: o dinheiro entrou
export async function simulateDonationApproval(id) {
  await mockDelay(400)
  const user = requireSession()
  const db = withExpiredDonations(store.read())
  const row = db.donations.find((donation) => isSameId(donation.id, id))
  if (!row) throw mockHttpError(404, 'Doação não encontrada.')
  if (!isSameId(row.donor.id, user.id)) throw mockHttpError(403, 'Esta doação é de outra conta.')
  if (row.status === 'EXPIRED') throw mockHttpError(400, 'Este PIX expirou. Gere um novo para doar.')
  if (row.status === 'APPROVED') return toDonationDto(db, row, { withPix: true })

  const approved = { ...row, status: 'APPROVED', approvedAt: nowLocalIso() }
  const next = { ...db, donations: db.donations.map((donation) => (donation.id === row.id ? approved : donation)) }
  store.write(next)
  return toDonationDto(next, approved, { withPix: true })
}

// ---------- só do mock: dados de teste do painel (features/ong/panel/dev) ----------

// Grava campanhas da ONG logada já com as doações aprovadas. As linhas ficam
// marcadas com `demo: true` para removeDemoCampaigns apagar só elas
export async function insertDemoCampaigns(templates) {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()

  let campaignId = nextId(db.campaigns)
  let donationId = nextId(db.donations)
  const campaigns = []
  const donations = []
  for (const { donations: gifts, ...fields } of templates) {
    const campaign = { ...fields, id: campaignId++, deleted: false, ngo: ngoSnapshot(user), demo: true }
    campaigns.push(campaign)
    donations.push(
      ...gifts.map(({ amount, approvedAt, donor }) => ({
        id: donationId++,
        amount,
        status: 'APPROVED',
        createdAt: approvedAt,
        approvedAt,
        expiresAt: null,
        pix: null,
        donor,
        campaign: { id: campaign.id, title: campaign.title, ngoName: campaign.ngo.name },
        demo: true,
      }))
    )
  }
  store.write({ ...db, campaigns: [...db.campaigns, ...campaigns], donations: [...db.donations, ...donations] })
}

export async function removeDemoCampaigns() {
  await mockDelay()
  const db = store.read()
  store.write({
    ...db,
    campaigns: db.campaigns.filter((row) => !row.demo),
    donations: db.donations.filter((row) => !row.demo),
  })
}
