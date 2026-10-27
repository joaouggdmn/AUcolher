import { addDaysIso, toLocalIsoDate } from '../../../core/utils/localDate'

// 🔴 Conteúdo dos dados de teste do painel do admin (adminDemoData.js): só
// campanhas, que ainda são mock. As datas são relativas ao dia em que se
// gera, então os gráficos dos últimos 6 meses sempre têm o que mostrar. As
// donas das campanhas são ONGs fictícias (ids a partir de 101): não existem
// no banco real, então nada disto aparece no painel de uma ONG de verdade
const DEMO_NGOS = [
  { id: 101, name: 'Instituto Focinho Feliz', city: 'Criciúma' },
  { id: 105, name: 'Lar Temporário Quatro Patas', city: 'Tubarão' },
  { id: 109, name: 'Projeto Miau Sul', city: 'Laguna' },
  { id: 114, name: 'Associação Amigos de Rua', city: 'Imbituba' },
  { id: 120, name: 'SOS Bichos Laguna', city: 'Laguna' },
]

// Quem doa nas campanhas de teste
const DONOR_NAMES = [
  'Ana Clara Rocha', 'Bruno Sales', 'Cecília Ramos', 'Daniel Moura', 'Eduarda Lins', 'Fábio Nogueira',
  'Giovana Reis', 'Henrique Prado', 'Isadora Melo', 'Júlio Pacheco', 'Kátia Rezende', 'Lucas Brandão',
]

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

export function buildDemoCampaigns() {
  let donorIndex = 0

  return CAMPAIGNS.map(({ ngo, title, category, goal, openedMonthsAgo, gifts }, index) => {
    const createdDay = dayInMonth(openedMonthsAgo, 4)
    const closedDay = addDaysIso(createdDay, 40)
    const lastDay = closedDay < dayInMonth(0, 31) ? closedDay : dayInMonth(0, 31)

    const donations = Array.from({ length: gifts }, (_, giftIndex) => {
      const offset = Math.round((giftIndex / gifts) * 38)
      const day = addDaysIso(createdDay, offset + 1)
      const donorName = DONOR_NAMES[donorIndex % DONOR_NAMES.length]
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
