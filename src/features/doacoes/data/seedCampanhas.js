import { SEED_NGOS, SEED_PEOPLE } from '../../../core/services/mock/seedAccounts'
import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'

// 🔴 Seed do banco falso de campanhas (doacoesMock.js). Prazos e datas são
// relativos ao dia em que o seed roda, então nada "envelhece". As
// organizadoras e os doadores são as contas do banco de teste
// (docs/seed-banco-completo.sql, ids em seedAccounts.js). O seed cobre todos
// os estados: urgente (no máximo uma ativa por ONG; a mais recente vira o
// banner SOS), quase na meta, meta batida, recém-criada sem doações, sem
// prazo, categoria "Outro", encerrada pela ONG e com prazo vencido. O
// arrecadado não é guardado: sai da soma das doações aprovadas

const cover = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

const COVERS = {
  frenchie: cover('1583511655857-d19b40a7a54e'),
  gatoECao: cover('1450778869180-41d0601e046e'),
  racao: cover('1601758228041-f3b2795255f1'),
  matilha: cover('1494947665470-20322015e3a8'),
  resgate: cover('1504595403659-9088ce801e29'),
  veterinaria: cover('1628009368231-7bb7cfcb0def'),
  larTemporario: cover('1601758003122-53c40e686a19'),
  gatil: cover('1533738363-b7f9aef128ce'),
  chow: cover('1505628346881-b72b27e84530'),
  samoieda: cover('1596492784531-6e6eb5ea9993'),
  idosos: cover('1535930891776-0c2dfb7fda1a'),
}

// createdDaysAgo: quando a ONG criou; deadlineIn: dias até o prazo (null =
// sem prazo; negativo = já venceu); raised: total que as doações somam
const CAMPAIGNS = [
  {
    id: 1, ngo: SEED_NGOS.apacri, category: 'HEALTH', isUrgent: true, goalAmount: 6000, raised: 2350,
    createdDaysAgo: 3, deadlineIn: 18, coverUrl: COVERS.frenchie,
    title: 'Cirurgia urgente da Estrela',
    description: 'A Estrela foi atropelada no bairro Pio Corrêa e fraturou a pata traseira. O valor cobre a cirurgia ortopédica, a internação e as primeiras sessões de fisioterapia.',
  },
  {
    id: 2, ngo: SEED_NGOS.apacri, category: 'NEUTERING', isUrgent: false, goalAmount: 5000, raised: 1200,
    createdDaysAgo: 12, deadlineIn: 45, coverUrl: COVERS.gatoECao,
    title: 'Mutirão de castração em Criciúma',
    description: 'Castração gratuita de 50 cães e gatos de famílias de baixa renda, para reduzir o número de filhotes abandonados nas ruas da cidade.',
  },
  {
    id: 3, ngo: SEED_NGOS.sosViralata, category: 'FOOD', isUrgent: false, goalAmount: 3000, raised: 2750,
    createdDaysAgo: 25, deadlineIn: null, coverUrl: COVERS.racao,
    title: 'Ração para 80 resgatados',
    description: 'O estoque de ração está acabando e precisamos alimentar 80 cães e gatos neste mês. Cada R$ 25 garante a comida de um animal por uma semana.',
  },
  {
    id: 4, ngo: SEED_NGOS.sosViralata, category: 'INFRASTRUCTURE', isUrgent: true, goalAmount: 8000, raised: 3100,
    createdDaysAgo: 2, deadlineIn: 30, coverUrl: COVERS.matilha,
    title: 'O telhado do canil caiu',
    description: 'O temporal da semana passada derrubou parte do telhado do canil. Os cães estão provisoriamente na garagem e precisamos reconstruir antes do inverno.',
  },
  {
    id: 5, ngo: SEED_NGOS.acapra, category: 'RESCUE', isUrgent: false, goalAmount: 10000, raised: 10450,
    createdDaysAgo: 30, deadlineIn: 10, coverUrl: COVERS.resgate,
    title: 'Resgate de animais em áreas alagadas',
    description: 'Combustível, caixas de transporte e atendimento veterinário para os animais resgatados nas enchentes. A meta foi batida: o que passar dela vai para os próximos resgates.',
  },
  {
    id: 6, ngo: SEED_NGOS.acapra, category: 'HEALTH', isUrgent: false, goalAmount: 2500, raised: 0,
    createdDaysAgo: 0, deadlineIn: null, coverUrl: COVERS.veterinaria,
    title: 'Vacinas para os resgatados de outubro',
    description: 'Campanha recém-lançada: vacinas V10 e antirrábica para os 35 animais resgatados neste mês.',
  },
  {
    id: 7, ngo: SEED_NGOS.protecaoUnida, category: 'OTHER', customCategory: 'Lar temporário', isUrgent: false, goalAmount: 4000, raised: 900,
    createdDaysAgo: 15, deadlineIn: null, coverUrl: COVERS.larTemporario,
    title: 'Rede de lares temporários',
    description: 'Ajuda de custo com ração e areia para as famílias que recebem animais em lar temporário enquanto eles esperam a adoção.',
  },
  {
    id: 8, ngo: SEED_NGOS.abrigoAnimal, category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 20000, raised: 6200,
    createdDaysAgo: 50, deadlineIn: 90, coverUrl: COVERS.gatil,
    title: 'Ampliação do gatil',
    description: 'Construção de uma nova ala no gatil, com área de quarentena separada para os gatos recém-resgatados.',
  },
  {
    id: 9, ngo: SEED_NGOS.abrigoAnimal, category: 'FOOD', isUrgent: false, goalAmount: 3000, raised: 3400,
    createdDaysAgo: 70, deadlineIn: null, closedDaysAgo: 20, coverUrl: COVERS.racao,
    title: 'Ração para o inverno',
    description: 'Campanha encerrada pela ONG: a meta foi batida e a ração garantiu os meses mais frios.',
  },
  {
    id: 10, ngo: SEED_NGOS.amparoAnimal, category: 'HEALTH', isUrgent: true, goalAmount: 3500, raised: 800,
    createdDaysAgo: 4, deadlineIn: 25, coverUrl: COVERS.chow,
    title: 'Tratamento do Bob contra a cinomose',
    description: 'O Bob foi resgatado com cinomose e está internado. O valor cobre medicação, soro e as sessões de acupuntura para as sequelas.',
  },
  {
    id: 11, ngo: SEED_NGOS.amparoAnimal, category: 'NEUTERING', isUrgent: false, goalAmount: 4000, raised: 2100,
    createdDaysAgo: 60, deadlineIn: -3, coverUrl: COVERS.samoieda,
    title: 'Castração no São Cristóvão',
    description: 'O prazo desta campanha já venceu: ela aparece como encerrada, mesmo sem a ONG ter encerrado manualmente.',
  },
  {
    id: 12, ngo: SEED_NGOS.sosViralata, category: 'HEALTH', isUrgent: false, goalAmount: 1500, raised: 300,
    createdDaysAgo: 9, deadlineIn: null, coverUrl: COVERS.idosos,
    title: 'Fraldas e remédios para os idosos',
    description: 'Oito cães idosos do abrigo precisam de fraldas geriátricas e medicação para artrose todos os meses.',
  },
]

// Os doadores são as pessoas do banco de teste: o histórico de doações de
// cada uma aparece na conta dela
const DONORS = Object.values(SEED_PEOPLE)

// Valores típicos de doação; o último pedaço completa o total exato
const AMOUNT_CYCLE = [50, 100, 25, 200, 30, 500, 10, 150, 75, 300]

function splitIntoDonations(total) {
  const amounts = []
  let rest = total
  for (let index = 0; rest > 0; index += 1) {
    const amount = AMOUNT_CYCLE[index % AMOUNT_CYCLE.length]
    // Não deixa sobrar menos que a doação mínima no fim
    const next = rest - amount < 5 ? rest : Math.min(amount, rest)
    amounts.push(next)
    rest -= next
  }
  return amounts
}

function ngoSnapshot(ngo) {
  return { id: ngo.id, name: ngo.name, isVerified: true, photoUrl: null, city: ngo.city, state: ngo.state }
}

function timeOf(index) {
  return `${String(8 + (index % 13)).padStart(2, '0')}:${index % 2 ? '40' : '15'}:00`
}

export function buildSeedCampanhas() {
  const today = todayLocalIso()
  const campaigns = []
  const donations = []

  CAMPAIGNS.forEach(({ ngo, raised, createdDaysAgo, deadlineIn, closedDaysAgo, customCategory = null, ...fields }) => {
    const createdDay = addDaysIso(today, -createdDaysAgo)
    const campaign = {
      ...fields,
      customCategory,
      deadline: deadlineIn == null ? null : addDaysIso(today, deadlineIn),
      // Prazo vencido continua ACTIVE no banco: o encerramento é calculado na leitura
      status: closedDaysAgo == null ? 'ACTIVE' : 'CLOSED',
      createdAt: `${createdDay}T09:30:00`,
      closedAt: closedDaysAgo == null ? null : `${addDaysIso(today, -closedDaysAgo)}T18:00:00`,
      deleted: false,
      ngo: ngoSnapshot(ngo),
    }
    campaigns.push(campaign)

    // Doações espalhadas entre a criação e o fim da campanha (ou ontem — uma
    // doação "de hoje" poderia ficar num horário que ainda não chegou)
    const lastDaysAgo = closedDaysAgo ?? (deadlineIn != null && deadlineIn < 0 ? -deadlineIn : 1)
    const span = Math.max(createdDaysAgo - lastDaysAgo, 1)
    splitIntoDonations(raised).forEach((amount, index) => {
      const day = addDaysIso(today, -(lastDaysAgo + ((index * 7) % span)))
      const createdAt = `${day}T${timeOf(index + campaign.id)}`
      donations.push({
        id: donations.length + 1,
        amount,
        status: 'APPROVED',
        createdAt,
        approvedAt: createdAt,
        expiresAt: null,
        pix: null,
        donor: DONORS[(campaign.id * 3 + index) % DONORS.length],
        campaign: { id: campaign.id, title: campaign.title, ngoName: campaign.ngo.name },
      })
    })
  })

  return { campaigns, donations }
}
