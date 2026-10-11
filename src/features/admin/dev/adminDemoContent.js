import { addDaysIso, toLocalIsoDate } from '../../../core/utils/localDate'

// 🔴 Conteúdo dos dados de teste do painel do admin (adminDemoData.js). As
// datas são relativas ao dia em que se gera, então os gráficos dos últimos 6
// meses sempre têm o que mostrar. Os donos dos animais e das campanhas são as
// ONGs geradas do seed do admin (ids a partir de 101): não existem no banco
// real, então nada disto aparece no painel de uma ONG de verdade

// ONGs do seed do admin (features/admin/data/seedAdmin.js)
const DEMO_NGOS = [
  { id: 101, name: 'Instituto Focinho Feliz', city: 'Criciúma' },
  { id: 105, name: 'Lar Temporário Quatro Patas', city: 'Tubarão' },
  { id: 109, name: 'Projeto Miau Sul', city: 'Laguna' },
  { id: 114, name: 'Associação Amigos de Rua', city: 'Imbituba' },
  { id: 120, name: 'SOS Bichos Laguna', city: 'Laguna' },
]

const ADOPTER_NAMES = [
  'Ana Clara Rocha', 'Bruno Sales', 'Cecília Ramos', 'Daniel Moura', 'Eduarda Lins', 'Fábio Nogueira',
  'Giovana Reis', 'Henrique Prado', 'Isadora Melo', 'Júlio Pacheco', 'Kátia Rezende', 'Lucas Brandão',
]

const ANIMALS = [
  ['Pipoca', 'DOG'], ['Frajola', 'CAT'], ['Luna', 'DOG'], ['Tobias', 'DOG'], ['Mimi', 'CAT'], ['Bento', 'DOG'],
  ['Amora', 'CAT'], ['Pingo', 'DOG'], ['Salém', 'CAT'], ['Bolinha', 'DOG'], ['Nala', 'DOG'], ['Fumaça', 'CAT'],
  ['Paçoca', 'DOG'], ['Kiara', 'CAT'], ['Zeca', 'DOG'], ['Belinha', 'DOG'], ['Tigrão', 'CAT'], ['Duquesa', 'DOG'],
  ['Biscoito', 'DOG'], ['Mel', 'CAT'], ['Chico', 'DOG'], ['Pantera', 'CAT'], ['Lua', 'DOG'], ['Thor', 'DOG'],
  ['Cacau', 'CAT'],
]

// Adoções concluídas em cada um dos últimos 6 meses (o mais antigo primeiro):
// a curva cresce, como numa plataforma que está pegando tração
const CONCLUDED_PER_MONTH = [1, 2, 2, 3, 4, 3]
// O resto do funil: pedidos que pararam em cada etapa
const OPEN_REQUESTS = [
  ...Array(4).fill('PENDING'),
  ...Array(3).fill('ACCEPTED'),
  ...Array(2).fill('AWAITING_DELIVERY'),
  ...Array(2).fill('REJECTED'),
]

// Contas novas em cada um dos últimos 6 meses, também crescendo
const NEW_ACCOUNTS_PER_MONTH = [2, 2, 3, 3, 4, 4]
const ACCOUNT_NAMES = [
  ['Renata Gomes', 'PERSON'], ['Otávio Lima', 'PERSON'], ['Instituto Patinhas do Sul', 'NGO'], ['Sabrina Costa', 'PERSON'],
  ['Marcelo Dias', 'PERSON'], ['Helena Vieira', 'PERSON'], ['Igor Machado', 'PERSON'], ['Coletivo Gatos de Rua', 'NGO'],
  ['Priscila Ferraz', 'PERSON'], ['Vítor Campos', 'PERSON'], ['Laura Peixoto', 'PERSON'], ['Rafaela Antunes', 'PERSON'],
  ['Abrigo Esperança Animal', 'NGO'], ['Tiago Barcelos', 'PERSON'], ['Yasmin Rocha', 'PERSON'], ['Gabriel Fontes', 'PERSON'],
  ['Letícia Moraes', 'PERSON'], ['Caio Rezende', 'PERSON'],
]
const ACCOUNT_CITIES = ['Criciúma', 'Araranguá', 'Tubarão', 'Florianópolis', 'Içara', 'Laguna']

// Campanhas já encerradas (quase não aparecem na vitrine pública), com
// doações espalhadas entre a abertura e o encerramento
const CAMPAIGNS = [
  { ngo: 0, title: 'Castração em massa no inverno', category: 'HEALTH', goal: 6000, openedMonthsAgo: 5, gifts: 18 },
  { ngo: 1, title: 'Ração para o lar temporário', category: 'FOOD', goal: 2500, openedMonthsAgo: 4, gifts: 14 },
  { ngo: 2, title: 'Gatil novo para os resgatados', category: 'INFRASTRUCTURE', goal: 9000, openedMonthsAgo: 4, gifts: 22 },
  { ngo: 3, title: 'Vacinação dos filhotes', category: 'HEALTH', goal: 3000, openedMonthsAgo: 2, gifts: 16 },
  { ngo: 4, title: 'Reforma do canil', category: 'INFRASTRUCTURE', goal: 7000, openedMonthsAgo: 1, gifts: 12 },
]

const AMOUNTS = [10, 15, 20, 25, 30, 50, 50, 75, 100, 150, 200]

function slug(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.')
}

// Um dia do mês `monthsAgo` (0 = este mês), sem passar de hoje
function dayInMonth(monthsAgo, day) {
  const today = new Date()
  const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day)
  return toLocalIsoDate(date > today ? today : date)
}

function at(isoDate, hour) {
  return `${isoDate}T${String(hour).padStart(2, '0')}:00:00`
}

function ngoSnapshot(ngo) {
  return { id: ngo.id, name: ngo.name, isVerified: true, photoUrl: null, city: ngo.city, state: 'SC' }
}

export function buildDemoAccounts() {
  const accounts = []
  NEW_ACCOUNTS_PER_MONTH.forEach((count, index) => {
    const monthsAgo = NEW_ACCOUNTS_PER_MONTH.length - 1 - index
    for (let i = 0; i < count; i += 1) {
      const [name, userType] = ACCOUNT_NAMES[accounts.length]
      accounts.push({
        name,
        userType,
        email: userType === 'NGO' ? `contato@${slug(name).replace(/\./g, '')}.org.br` : `${slug(name)}@email.com`,
        photoUrl: null,
        city: ACCOUNT_CITIES[accounts.length % ACCOUNT_CITIES.length],
        state: 'SC',
        isVerified: userType === 'NGO',
        createdAt: at(dayInMonth(monthsAgo, 3 + i * 6), 10 + i),
      })
    }
  })
  return accounts
}

// Pedidos de adoção de animais do AUmatch (`source: 'legacy'`): entram nos
// números e gráficos de adoção, mas não na lista de anúncios da API
export function buildDemoRequests() {
  const requests = []
  let animalIndex = 0

  function request(status, { createdAt, concludedAt } = {}) {
    const [name, species] = ANIMALS[animalIndex % ANIMALS.length]
    const ngo = DEMO_NGOS[animalIndex % DEMO_NGOS.length]
    const adopterName = ADOPTER_NAMES[animalIndex % ADOPTER_NAMES.length]
    const animalId = 9000 + animalIndex
    animalIndex += 1

    return {
      id: `admin-demo-${animalIndex}`,
      adminDemo: true,
      animalId,
      ownerId: ngo.id,
      status,
      createdAt,
      ...(concludedAt && { concludedAt }),
      adopter: { userId: null, name: adopterName, photoUrl: null, city: ngo.city, state: 'SC' },
      animal: {
        source: 'legacy',
        id: animalId,
        name,
        photoUrl: null,
        species,
        ownerId: ngo.id,
        ownerName: ngo.name,
        ownerPhotoUrl: null,
        organizationName: ngo.name,
      },
    }
  }

  CONCLUDED_PER_MONTH.forEach((count, index) => {
    const monthsAgo = CONCLUDED_PER_MONTH.length - 1 - index
    for (let i = 0; i < count; i += 1) {
      const concludedDay = dayInMonth(monthsAgo, 6 + i * 6)
      requests.push(
        request('CONCLUDED', { createdAt: at(addDaysIso(concludedDay, -12), 14), concludedAt: at(concludedDay, 16) })
      )
    }
  })

  const today = dayInMonth(0, 31)
  OPEN_REQUESTS.forEach((status, index) => {
    requests.push(request(status, { createdAt: at(addDaysIso(today, -(2 + index * 3)), 11) }))
  })

  return requests
}

export function buildDemoCampaigns() {
  let donorIndex = 0

  return CAMPAIGNS.map(({ ngo, title, category, goal, openedMonthsAgo, gifts }, index) => {
    const createdDay = dayInMonth(openedMonthsAgo, 4)
    const closedDay = addDaysIso(createdDay, 40)
    const lastDay = closedDay < dayInMonth(0, 31) ? closedDay : dayInMonth(0, 31)

    const donations = Array.from({ length: gifts }, (_, giftIndex) => {
      const offset = Math.round((giftIndex / gifts) * 38)
      const day = addDaysIso(createdDay, offset + 1)
      const donorName = ADOPTER_NAMES[donorIndex % ADOPTER_NAMES.length]
      donorIndex += 1
      return {
        amount: AMOUNTS[(giftIndex * 7 + index) % AMOUNTS.length],
        approvedAt: at(day < lastDay ? day : lastDay, 9 + (giftIndex % 10)),
        donor: { id: null, name: donorName, photoUrl: null },
      }
    })

    return {
      title,
      description: 'Campanha de teste do painel do admin.',
      category,
      isUrgent: false,
      goalAmount: goal,
      coverUrl: null,
      deadline: null,
      status: 'CLOSED',
      createdAt: at(createdDay, 9),
      closedAt: at(lastDay, 18),
      ngo: ngoSnapshot(DEMO_NGOS[ngo]),
      donations,
    }
  })
}
