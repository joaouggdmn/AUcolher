import { createMockStore, getMockSession, isSameId, mockDelay, mockHttpError } from '../../../core/services/mock/mockStore'
import { USE_MOCK_REABANDONO } from '../../../core/utils/constants'
import { todayLocalIso, nowLocalIso } from '../../../core/utils/localDate'
import { MOCK_REABANDONO_STORE_KEY } from '../../../core/utils/storageKeys'
import { changeAnimalStatus, createAnimal, getAnimal } from '../../animais/services/animalService'
import { RETURN_NOTE_MAX_LENGTH, canHaveReturn } from '../utils/requestStatus'

// 🔴 "Servidor falso" do retorno e do repasse (USE_MOCK_REABANDONO), até as
// rotas da migração 012 existirem (docs/contratos-prontos/api-devolucao-reabandono.md).
// Os pedidos continuam vindo da API real; aqui ficam só:
// - `records`: um retorno (RETURNED) ou repasse (REHOMED) por pedido;
// - `frozenScores`: o score do AUmatch visto quando o pedido estava CONCLUDED,
//   no papel do `match_score_at_adoption` que a API vai gravar na conclusão.
// O AdoptionRequestProvider sobrepõe isso aos pedidos. O republicar já cria
// o anúncio de verdade, e o desfazer o tira do ar com o PATCH de sempre.
// Limitação: a API recusa mudar um animal adotado, então no retorno o anúncio
// só aparece fora do ar na tela; e o registro só existe neste navegador
const store = createMockStore({
  key: MOCK_REABANDONO_STORE_KEY,
  version: 1,
  seed: () => ({ records: [], frozenScores: [] }),
})

// Avisa a própria aba (o evento 'storage' só chega nas outras)
const CHANGE_EVENT = 'aucolher:reabandono'

function write(data) {
  store.write(data)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// ---------- leitura (camada sobre os pedidos) ----------

// Para o useSyncExternalStore (useReturnsMock): o texto gravado serve de versão
export function getReturnsSnapshot() {
  return USE_MOCK_REABANDONO ? localStorage.getItem(MOCK_REABANDONO_STORE_KEY) : null
}

export function subscribeReturns(callback) {
  function handleStorage(event) {
    if (event.key === null || event.key === MOCK_REABANDONO_STORE_KEY) callback()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function readReturnsData() {
  return USE_MOCK_REABANDONO ? store.read() : { records: [], frozenScores: [] }
}

function toReturnInfo(record) {
  return {
    type: record.type,
    date: record.date,
    reason: record.reason,
    note: record.note,
    recordedAt: record.recordedAt,
    rehomedAnimalId: record.rehomedAnimalId ?? null,
  }
}

// O pedido como a API vai devolver depois da 012: status RETURNED/REHOMED,
// o bloco do retorno e o score congelado. Só mexe em pedido concluído (ou já
// sobreposto, para uma correção do retorno aparecer na hora). As rotas abaixo
// recebem o pedido como a API devolveu, sem esta camada
export function withReturnRecord(request, data = readReturnsData()) {
  const frozen = data.frozenScores.find((row) => isSameId(row.requestId, request.id))
  const withScore =
    request.matchScoreAtAdoption == null && frozen ? { ...request, matchScoreAtAdoption: frozen.score } : request

  const record = data.records.find((row) => isSameId(row.requestId, request.id))
  if (!record || (request.status !== 'CONCLUDED' && request.status !== record.type)) return withScore
  return { ...withScore, status: record.type, returnInfo: toReturnInfo(record) }
}

// O pedido de onde veio um anúncio republicado (a API manda `originRequestId`)
export function originRequestIdOf(animal, data = readReturnsData()) {
  if (animal.originRequestId != null) return animal.originRequestId
  return data.records.find((row) => isSameId(row.rehomedAnimalId, animal.id))?.requestId ?? null
}

// Congela o score dos pedidos concluídos que ainda não têm um: é o que a
// API vai fazer no `conclude`. ONG adotando fica sem score (e fora da taxa)
export function freezeConcludedScores(requests) {
  if (!USE_MOCK_REABANDONO) return
  const data = store.read()
  const fresh = requests.filter(
    (request) =>
      request.status === 'CONCLUDED' &&
      typeof request.matchScore === 'number' &&
      canHaveReturn(request) &&
      !data.frozenScores.some((row) => isSameId(row.requestId, request.id))
  )
  if (fresh.length === 0) return
  write({
    ...data,
    frozenScores: [...data.frozenScores, ...fresh.map((request) => ({ requestId: request.id, score: request.matchScore }))],
  })
}

// ---------- validações (mesmas mensagens do contrato §3) ----------

function currentStatus(request, data) {
  return withReturnRecord(request, data).status
}

function assertReasonAndNote({ reason, note }) {
  if (!reason) throw mockHttpError(400, 'Escolha o motivo')
  const trimmed = note?.trim() ?? ''
  if (reason === 'OTHER' && !trimmed) throw mockHttpError(400, 'Descreva o motivo')
  if (trimmed.length > RETURN_NOTE_MAX_LENGTH) {
    throw mockHttpError(400, `A observação pode ter no máximo ${RETURN_NOTE_MAX_LENGTH} caracteres`)
  }
  return trimmed || null
}

function assertAdopter(request) {
  if (!isSameId(getMockSession()?.id, request.adopter?.userId)) {
    throw mockHttpError(403, 'Só quem adotou pode republicar o animal')
  }
  if (!canHaveReturn(request)) throw mockHttpError(400, 'Adoções feitas por ONG não têm retorno nem repasse')
}

function assertCanRehome(status) {
  if (status === 'RETURNED') throw mockHttpError(400, 'Este animal já voltou para quem doou')
  if (status !== 'CONCLUDED') throw mockHttpError(400, 'Só uma adoção concluída pode ser republicada')
}

function saveRecord(data, record) {
  const others = data.records.filter((row) => !isSameId(row.requestId, record.requestId))
  const next = { ...data, records: [...others, record] }
  write(next)
  return next
}

// ---------- rotas ----------

// POST /adoption-requests/{id}/return — registra ou corrige o retorno
export async function registerReturn(request, { returnDate, reason, note }) {
  await mockDelay()
  const data = store.read()

  if (!isSameId(getMockSession()?.id, request.ownerId)) {
    throw mockHttpError(403, 'Só quem doou o animal registra o retorno')
  }
  if (!canHaveReturn(request)) throw mockHttpError(400, 'Adoções feitas por ONG não têm retorno nem repasse')

  const status = currentStatus(request, data)
  if (status === 'REHOMED') throw mockHttpError(400, 'O adotante já anunciou este animal para uma nova adoção')
  if (status !== 'CONCLUDED' && status !== 'RETURNED') {
    throw mockHttpError(400, 'Só uma adoção concluída pode ter o retorno registrado')
  }

  if (!returnDate) throw mockHttpError(400, 'Informe a data do retorno')
  if (returnDate > todayLocalIso()) throw mockHttpError(400, 'A data do retorno não pode ser futura')
  if (request.concludedAt && returnDate < request.concludedAt.slice(0, 10)) {
    throw mockHttpError(400, 'A data do retorno não pode ser anterior à adoção')
  }
  const cleanNote = assertReasonAndNote({ reason, note })

  const next = saveRecord(data, {
    requestId: request.id,
    type: 'RETURNED',
    date: returnDate,
    reason,
    note: cleanNote,
    recordedAt: nowLocalIso(),
    rehomedAnimalId: null,
  })
  return withReturnRecord(request, next)
}

// GET /adoption-requests/{id}/rehome-draft — o anúncio original, para o
// formulário nascer preenchido
export async function getRehomeDraft(request) {
  const data = store.read()
  assertAdopter(request)
  assertCanRehome(currentStatus(request, data))
  return getAnimal(request.animalId)
}

// POST /adoption-requests/{id}/rehome — cria o anúncio novo em nome do
// adotante e marca o pedido como REHOMED
export async function rehome(request, { reason, note, form, photos }) {
  const data = store.read()
  assertAdopter(request)
  assertCanRehome(currentStatus(request, data))
  const cleanNote = assertReasonAndNote({ reason, note })

  const created = await createAnimal(form, photos)
  const next = saveRecord(store.read(), {
    requestId: request.id,
    type: 'REHOMED',
    date: todayLocalIso(),
    reason,
    note: cleanNote,
    recordedAt: nowLocalIso(),
    rehomedAnimalId: created.id,
  })
  return withReturnRecord(request, next)
}

// POST /adoption-requests/{id}/rehome/undo — "Desisti de doar": o anúncio
// novo sai do ar (a API cancela os pedidos ativos dele) e a adoção volta a
// ser só concluída
export async function undoRehome(request) {
  const data = store.read()
  assertAdopter(request)
  const record = data.records.find((row) => isSameId(row.requestId, request.id))
  if (!record || record.type !== 'REHOMED') throw mockHttpError(400, 'Esta adoção não foi republicada')

  const rehomed = await getAnimal(record.rehomedAnimalId).catch(() => null)
  if (rehomed?.status === 'ADOPTED') {
    throw mockHttpError(400, 'O anúncio já gerou uma nova adoção: não dá para desfazer')
  }
  if (rehomed && rehomed.status !== 'INACTIVE') await changeAnimalStatus(rehomed.id, 'INACTIVE')

  const next = { ...store.read() }
  next.records = next.records.filter((row) => !isSameId(row.requestId, request.id))
  write(next)
  return withReturnRecord(request, next)
}
