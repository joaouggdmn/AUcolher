import { USE_MOCK_CAMPANHAS, USE_MOCK_EVENTOS } from '../../../../core/utils/constants'
import { changeAnimalStatus, createAnimal, listMyAnimals } from '../../../animais/services/animalService'
import { insertDemoCampaigns, removeDemoCampaigns } from '../../../doacoes/services/doacoesMock'
import { insertDemoEvents, removeDemoEvents } from '../../../eventos/services/eventosMock'
import { buildDemoCampaigns, buildDemoEvents, DEMO_ANIMALS } from './demoContent'

// 🔴 Dados de teste do painel (só em dev). Animais vão para o banco pela API,
// logado como a ONG; eventos, campanhas e doações ficam no localStorage,
// marcados com `demo: true`. Pedidos de adoção são reais e precisam de
// adotantes de verdade: para testar, use docs/seed-pedidos-teste.sql ou peça
// os animais com outra conta. O que foi criado fica anotado em
// `aucolher_demo_seed_<ongId>` para gerar de novo sem duplicar

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

// `onProgress` recebe o passo atual, para a tela mostrar. Quem chama
// recarrega a página no fim: os contextos e o cache releem tudo
export async function generateDemoData(user, onProgress) {
  await ensureDemoAnimals(user, onProgress)

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
