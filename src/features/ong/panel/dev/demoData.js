import { changeAnimalStatus, createAnimal, listMyAnimals } from '../../../animais/services/animalService'
import { closeCampaign, createCampaign, deleteCampaign } from '../../../doacoes/services/doacoesApi'
import { createEvent, deleteEvent } from '../../../eventos/services/eventosApi'
import { buildDemoCampaigns, buildDemoEvents, DEMO_ANIMALS } from './demoContent'

// 🔴 Dados de teste do painel (só em dev). Animais, eventos e campanhas vão
// para o banco pela API, logado como a ONG. Doações, pedidos de adoção e
// presenças são reais e precisam de contas de verdade (e de um PIX): para
// testar pedidos, use docs/seed-pedidos-teste.sql ou peça os animais com
// outra conta. O que foi criado fica anotado em `aucolher_demo_seed_<ongId>`
// para gerar de novo sem duplicar

function seedKey(userId) {
  return `aucolher_demo_seed_${userId}`
}

function readSeed(userId) {
  try {
    return JSON.parse(localStorage.getItem(seedKey(userId))) ?? {}
  } catch {
    return {}
  }
}

function saveSeed(userId, seed) {
  localStorage.setItem(seedKey(userId), JSON.stringify(seed))
}

export function isDemoDataActive(userId) {
  return Boolean(readSeed(userId).active)
}

// Reaproveita os animais de testes anteriores. Adotado é definitivo na API,
// então só serve de novo para quem termina adotado; fora do ar é reativado
async function ensureDemoAnimals(user, onProgress) {
  const seed = readSeed(user.id)
  const savedIds = { ...seed.animals }
  const mine = new Map((await listMyAnimals()).map((animal) => [String(animal.id), animal]))
  const animals = {}

  for (const [index, { key, finalStatus, form, photos }] of DEMO_ANIMALS.entries()) {
    onProgress(`Cadastrando animais (${index + 1} de ${DEMO_ANIMALS.length})...`)
    let animal = mine.get(String(savedIds[key]))
    if (animal?.status === 'ADOPTED' && finalStatus !== 'ADOPTED') animal = null
    if (!animal) animal = await createAnimal(form, photos)

    if (finalStatus === 'INACTIVE' && animal.status !== 'INACTIVE') {
      animal = await changeAnimalStatus(animal.id, 'INACTIVE')
    } else if (finalStatus === 'ADOPTED' && animal.status !== 'ADOPTED') {
      // Sem pedido de demonstração, o adotado é marcado direto pelo dono
      animal = await changeAnimalStatus(animal.id, 'ADOPTED')
    } else if (finalStatus === 'AVAILABLE' && animal.status === 'INACTIVE') {
      animal = await changeAnimalStatus(animal.id, 'AVAILABLE')
    }

    animals[key] = animal
    savedIds[key] = animal.id
    // A cada animal: se algo falhar no meio, a próxima tentativa não duplica
    saveSeed(user.id, { ...seed, animals: savedIds })
  }

  return animals
}

// Apaga os eventos de teste anotados. 404 = já foi apagado; 400 = já
// aconteceu (a API não deixa excluir) — nos dois casos, sai da anotação
async function removeDemoEvents(user) {
  for (const id of readSeed(user.id).events ?? []) {
    try {
      await deleteEvent(id)
    } catch (err) {
      const status = err.response?.status
      if (status !== 404 && status !== 400) throw err
    }
    const seed = readSeed(user.id)
    saveSeed(user.id, { ...seed, events: (seed.events ?? []).filter((savedId) => savedId !== id) })
  }
}

async function createDemoEvents(user, onProgress) {
  const payloads = buildDemoEvents(user)
  for (const [index, payload] of payloads.entries()) {
    onProgress(`Criando eventos (${index + 1} de ${payloads.length})...`)
    const event = await createEvent(payload)
    // A cada evento: se algo falhar no meio, a próxima tentativa apaga o que já foi criado
    const seed = readSeed(user.id)
    saveSeed(user.id, { ...seed, events: [...(seed.events ?? []), event.id] })
  }
}

// Apaga as campanhas de teste anotadas e as tira da anotação (404 = já foi
// apagada). Com doação aprovada, a API só esconde a campanha: o histórico de
// quem doou continua
async function removeDemoCampaigns(user) {
  for (const id of readSeed(user.id).campaigns ?? []) {
    try {
      await deleteCampaign(id)
    } catch (err) {
      if (err.response?.status !== 404) throw err
    }
    const seed = readSeed(user.id)
    saveSeed(user.id, { ...seed, campaigns: (seed.campaigns ?? []).filter((savedId) => savedId !== id) })
  }
}

// 409 = a ONG já tem uma campanha urgente de verdade: a de teste entra sem urgência
async function createCampaignOrNotUrgent(payload) {
  try {
    return await createCampaign(payload)
  } catch (err) {
    if (err.response?.status !== 409 || !payload.isUrgent) throw err
    return createCampaign({ ...payload, isUrgent: false })
  }
}

async function createDemoCampaigns(user, onProgress) {
  const templates = buildDemoCampaigns()
  for (const [index, { payload, close }] of templates.entries()) {
    onProgress(`Criando campanhas (${index + 1} de ${templates.length})...`)
    const campaign = await createCampaignOrNotUrgent(payload)
    // A cada campanha: se algo falhar no meio, a próxima tentativa apaga o que já foi criado
    const seed = readSeed(user.id)
    saveSeed(user.id, { ...seed, campaigns: [...(seed.campaigns ?? []), campaign.id] })
    if (close) await closeCampaign(campaign.id)
  }
}

// `onProgress` recebe o passo atual, para a tela mostrar. Quem chama
// recarrega a página no fim: os contextos e o cache releem tudo
export async function generateDemoData(user, onProgress) {
  await ensureDemoAnimals(user, onProgress)

  onProgress('Apagando eventos de teste anteriores...')
  await removeDemoEvents(user)
  await createDemoEvents(user, onProgress)

  // Antes de criar: libera a vaga da campanha urgente da geração anterior
  onProgress('Apagando campanhas de teste anteriores...')
  await removeDemoCampaigns(user)
  await createDemoCampaigns(user, onProgress)

  saveSeed(user.id, { ...readSeed(user.id), active: true })
}

// A API não apaga animal de verdade: os disponíveis saem do ar e os adotados
// continuam adotados. Os ids continuam anotados para a próxima geração
export async function removeDemoData(user, onProgress) {
  onProgress('Apagando eventos...')
  await removeDemoEvents(user)

  onProgress('Apagando campanhas...')
  await removeDemoCampaigns(user)

  onProgress('Tirando os animais de teste do ar...')
  const seed = readSeed(user.id)
  const demoIds = new Set(Object.values(seed.animals ?? {}).map(String))
  for (const animal of await listMyAnimals()) {
    if (demoIds.has(String(animal.id)) && animal.status === 'AVAILABLE') {
      await changeAnimalStatus(animal.id, 'INACTIVE')
    }
  }

  saveSeed(user.id, { ...seed, active: false })
}
