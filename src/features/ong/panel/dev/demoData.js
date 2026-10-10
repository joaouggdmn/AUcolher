import { USE_MOCK_CAMPANHAS, USE_MOCK_EVENTOS } from '../../../../core/utils/constants'
import {
  ADOPTION_REQUESTS_STORAGE_KEY,
  chatLastSeenStorageKey,
  chatMessagesStorageKey,
} from '../../../../core/utils/storageKeys'
import { buildAnimalSnapshot } from '../../../adocao/utils/requestAnimal'
import { changeAnimalStatus, createAnimal, listMyAnimals } from '../../../animais/services/animalService'
import { insertDemoCampaigns, removeDemoCampaigns } from '../../../doacoes/services/doacoesMock'
import { insertDemoEvents, removeDemoEvents } from '../../../eventos/services/eventosMock'
import {
  buildDemoCampaigns,
  buildDemoEvents,
  DEMO_ADOPTERS,
  DEMO_ANIMALS,
  DEMO_CHATS,
  DEMO_REQUESTS,
  demoMessageTime,
  demoRequestDates,
} from './demoContent'

// 🔴 Dados de teste do painel (só em dev). Animais vão para o banco pela API,
// logado como a ONG; pedidos, conversas, eventos, campanhas e doações ficam
// no localStorage, marcados com `demo: true`. O que foi criado fica anotado
// em `aucolher_demo_seed_<ongId>` para gerar de novo sem duplicar

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

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
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
    } else if (finalStatus !== 'INACTIVE' && animal.status === 'INACTIVE') {
      animal = await changeAnimalStatus(animal.id, 'AVAILABLE')
    }

    animals[key] = animal
    savedIds[key] = animal.id
    // A cada animal: se algo falhar no meio, a próxima tentativa não duplica
    saveSeed(user.id, { ...seed, animals: savedIds })
  }

  return animals
}

function clearDemoRequests(userId) {
  const requests = readJson(ADOPTION_REQUESTS_STORAGE_KEY, [])
  const demoIds = requests.filter((request) => request.demo).map((request) => request.id)
  demoIds.forEach((id) => localStorage.removeItem(chatMessagesStorageKey(id)))

  const lastSeen = readJson(chatLastSeenStorageKey(userId), {})
  demoIds.forEach((id) => delete lastSeen[id])

  localStorage.setItem(chatLastSeenStorageKey(userId), JSON.stringify(lastSeen))
  localStorage.setItem(ADOPTION_REQUESTS_STORAGE_KEY, JSON.stringify(requests.filter((request) => !request.demo)))
}

function writeDemoRequests(user, animals) {
  const baseId = Date.now()
  const lastSeen = readJson(chatLastSeenStorageKey(user.id), {})

  const requests = DEMO_REQUESTS.map((spec, index) => {
    const id = baseId + index
    const animal = animals[spec.animal]
    const adopter = DEMO_ADOPTERS[spec.adopter]
    const { createdAt, concludedAt, reviewedAt } = demoRequestDates(spec)
    const messages = DEMO_CHATS[spec.key] ?? []

    if (messages.length > 0) {
      const adopterSenderId = `demo-adopter-${spec.adopter}`
      localStorage.setItem(
        chatMessagesStorageKey(id),
        JSON.stringify(
          messages.map((message, messageIndex) => ({
            id: id * 100 + messageIndex,
            senderId: { adopter: adopterSenderId, ong: user.id, system: 'system' }[message.from],
            text: message.text,
            timestamp: demoMessageTime(message),
          }))
        )
      )
      // A ONG leu tudo até a primeira mensagem marcada como não lida
      const firstUnread = messages.find((message) => message.unread)
      const readUntil = firstUnread ? demoMessageTime(firstUnread) : demoMessageTime(messages.at(-1))
      lastSeen[id] = new Date(new Date(readUntil).getTime() - (firstUnread ? 60_000 : 0)).toISOString()
    }

    return {
      id,
      demo: true,
      animalId: animal.id,
      ownerId: user.id,
      status: spec.status,
      createdAt,
      ...(concludedAt && { concludedAt }),
      adopter,
      animal: buildAnimalSnapshot(animal, 'api'),
      ...(spec.review && {
        reviews: {
          adopter: {
            ...spec.review,
            authorId: null,
            authorName: adopter.name,
            authorPhotoUrl: adopter.photoUrl,
            authorIsOng: false,
            createdAt: reviewedAt,
            updatedAt: null,
          },
        },
      }),
    }
  })

  const stored = readJson(ADOPTION_REQUESTS_STORAGE_KEY, [])
  localStorage.setItem(ADOPTION_REQUESTS_STORAGE_KEY, JSON.stringify([...requests, ...stored]))
  localStorage.setItem(chatLastSeenStorageKey(user.id), JSON.stringify(lastSeen))
}

// `onProgress` recebe o passo atual, para a tela mostrar. Quem chama
// recarrega a página no fim: os contextos e o cache releem tudo
export async function generateDemoData(user, onProgress) {
  const animals = await ensureDemoAnimals(user, onProgress)

  onProgress('Criando pedidos de adoção e conversas...')
  clearDemoRequests(user.id)
  writeDemoRequests(user, animals)

  if (USE_MOCK_EVENTOS) {
    onProgress('Criando eventos...')
    await removeDemoEvents()
    await insertDemoEvents(buildDemoEvents(user))
  }
  if (USE_MOCK_CAMPANHAS) {
    onProgress('Criando campanhas e doações...')
    await removeDemoCampaigns()
    await insertDemoCampaigns(buildDemoCampaigns())
  }

  saveSeed(user.id, { ...readSeed(user.id), active: true })
}

// A API não apaga animal de verdade: os disponíveis saem do ar e os adotados
// continuam adotados. Os ids continuam anotados para a próxima geração
export async function removeDemoData(user, onProgress) {
  onProgress('Apagando pedidos e conversas...')
  clearDemoRequests(user.id)

  if (USE_MOCK_EVENTOS) {
    onProgress('Apagando eventos...')
    await removeDemoEvents()
  }
  if (USE_MOCK_CAMPANHAS) {
    onProgress('Apagando campanhas e doações...')
    await removeDemoCampaigns()
  }

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
