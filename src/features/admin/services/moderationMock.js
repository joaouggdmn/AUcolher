import { createMockStore, isSameId } from '../../../core/services/mock/mockStore'
import { USE_MOCK_ADMIN } from '../../../core/utils/constants'
import { MOCK_MODERACAO_STORE_KEY } from '../../../core/utils/storageKeys'
import { nowLocalIso } from '../../../core/utils/localDate'

// 🔴 Decisões de moderação no modo mock (USE_MOCK_ADMIN): quem o admin baniu
// e quais anúncios de animais ele removeu. A API ainda não sabe disso, então
// o site consulta este "banco" para esconder o conteúdo e recusar o login
// dessas contas. Com as rotas de moderação no backend, quem filtra é a
// própria API e tudo aqui responde "nada foi moderado"
const store = createMockStore({
  key: MOCK_MODERACAO_STORE_KEY,
  version: 1,
  seed: () => ({ bannedAccounts: [], removedAnimals: [] }),
})

// Avisa a própria aba (o evento 'storage' só chega nas outras)
const CHANGE_EVENT = 'aucolher:moderation'

// No mock, uma conta é id + nome: os ids 1 a 7 dos perfis fictícios se
// repetem com os do banco real (docs/planos-front/plano-painel-admin.md §6), e mesmo id com
// outro nome é outra conta. Sem nome conhecido (pedido antigo sem cópia), vale o id
export function matchesAccount(account, candidate) {
  if (!account || !candidate || !isSameId(account.id, candidate.id)) return false
  return candidate.name == null || account.name == null || account.name === candidate.name
}

// ---------- leitura (site e servidores falsos) ----------

export function readBannedAccounts() {
  return USE_MOCK_ADMIN ? store.read().bannedAccounts : []
}

// `account`: qualquer coisa com { id, name } — dono de um animal, ONG de uma
// campanha, usuário logado, adotante de um pedido
export function isAccountBanned(account, bannedAccounts = readBannedAccounts()) {
  return bannedAccounts.some((banned) => matchesAccount(banned, account))
}

export function readRemovedAnimals() {
  return USE_MOCK_ADMIN ? store.read().removedAnimals : []
}

// Os anúncios são da API real, com id único: basta o id
export function isAnimalRemoved(animal, removedAnimals = readRemovedAnimals()) {
  return removedAnimals.some((removed) => isSameId(removed.id, animal.id))
}

// Para o useSyncExternalStore (useModeration): o texto gravado muda a cada
// decisão, então serve de "versão" sem precisar comparar listas
export function getModerationSnapshot() {
  return USE_MOCK_ADMIN ? localStorage.getItem(MOCK_MODERACAO_STORE_KEY) : null
}

export function subscribeModeration(callback) {
  function handleStorage(event) {
    if (event.key === null || event.key === MOCK_MODERACAO_STORE_KEY) callback()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

// ---------- escrita (só o adminMock) ----------

function write(data) {
  store.write(data)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function banAccount(account) {
  const db = store.read()
  const others = db.bannedAccounts.filter((banned) => !matchesAccount(banned, account))
  const banned = { id: account.id, name: account.name, userType: account.userType ?? null, bannedAt: nowLocalIso() }
  write({ ...db, bannedAccounts: [...others, banned] })
}

export function reactivateAccount(account) {
  const db = store.read()
  write({ ...db, bannedAccounts: db.bannedAccounts.filter((banned) => !matchesAccount(banned, account)) })
}

// Remoção definitiva: o dono não consegue reativar (não há "desfazer")
export function removeAnimalListing(animal) {
  const db = store.read()
  if (isAnimalRemoved(animal, db.removedAnimals)) return
  const removed = { id: animal.id, ownerId: animal.ownerId ?? null, name: animal.name, removedAt: nowLocalIso() }
  write({ ...db, removedAnimals: [...db.removedAnimals, removed] })
}
