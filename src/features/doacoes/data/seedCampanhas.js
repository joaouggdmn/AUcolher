import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'
import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'

// 🔴 Seed do banco falso de campanhas (doacoesMock.js). Prazos e datas são
// relativos ao dia em que o seed roda, então nada "envelhece". Organizadoras
// são as ONGs 1, 4 e 5 de mockPublicProfiles, e o seed cobre todos os
// estados: urgente (a mais recente vira o banner SOS), quase na meta, meta
// atingida, recém-criada sem doações, sem prazo, encerrada pela ONG e com
// prazo vencido. O arrecadado não é guardado: sai da soma das doações
// aprovadas, que o seed gera com doadores fictícios

const COVERS = {
  rex: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
  racao: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
  canil: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=80',
  gata: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
  // A foto do mock antigo (photo-1517849845537) saiu do ar
  cobertor: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80',
  vacina: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=80',
  castracao: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
  idoso: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
  gatil: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
  filhotes: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=1200&q=80',
  fisio: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&w=1200&q=80',
}

// createdDaysAgo: quando a ONG criou; deadlineIn: dias até o prazo (null =
// sem prazo; negativo = já venceu); raised: total que as doações somam
const CAMPAIGNS = [
  {
    id: 1, ngoId: 1, category: 'HEALTH', isUrgent: true, goalAmount: 8000, raised: 3200,
    createdDaysAgo: 2, deadlineIn: 20, coverUrl: COVERS.rex,
    title: 'Cirurgia urgente do Rex',
    description: 'Rex foi atropelado e precisa de uma cirurgia ortopédica com urgência. Sem o procedimento, ele pode perder o movimento da pata traseira. O valor cobre a cirurgia, a internação e as primeiras sessões de fisioterapia.',
  },
  {
    id: 2, ngoId: 5, category: 'FOOD', isUrgent: false, goalAmount: 2000, raised: 1800,
    createdDaysAgo: 25, deadlineIn: null, coverUrl: COVERS.racao,
    title: 'Ração para 60 animais resgatados',
    description: 'Nosso estoque de ração está acabando e precisamos alimentar 60 cães e gatos resgatados neste mês. Cada R$ 25 garante a alimentação de um animal por uma semana.',
  },
  {
    id: 3, ngoId: 4, category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 15000, raised: 12000,
    createdDaysAgo: 40, deadlineIn: 45, coverUrl: COVERS.canil,
    title: 'Reforma do canil da nossa sede',
    description: 'O canil precisa de reforma estrutural para melhorar a ventilação e o conforto dos animais durante o verão: troca do telhado, piso antiderrapante e novos bebedouros.',
  },
  {
    id: 4, ngoId: 4, category: 'HEALTH', isUrgent: true, goalAmount: 1200, raised: 450,
    createdDaysAgo: 6, deadlineIn: 10, coverUrl: COVERS.gata,
    title: 'Tratamento de sarna da Mel',
    description: 'A gatinha Mel foi resgatada com sarna severa e precisa de medicação contínua por 60 dias, além de banhos terapêuticos semanais.',
  },
  {
    id: 5, ngoId: 1, category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 3000, raised: 900,
    createdDaysAgo: 18, deadlineIn: 30, coverUrl: COVERS.cobertor,
    title: 'Cobertores para o inverno',
    description: 'Com a queda de temperatura, precisamos de cobertores, mantas e casinhas forradas para manter os animais aquecidos no abrigo.',
  },
  {
    id: 6, ngoId: 5, category: 'HEALTH', isUrgent: false, goalAmount: 2500, raised: 2650,
    createdDaysAgo: 30, deadlineIn: 15, coverUrl: COVERS.vacina,
    title: 'Vacinas para os resgatados de outubro',
    description: 'Vacinas V10 e antirrábica para os 35 animais resgatados neste mês. A meta já foi batida, e o que passar dela vai para o próximo lote de resgates.',
  },
  {
    id: 7, ngoId: 1, category: 'HEALTH', isUrgent: false, goalAmount: 5000, raised: 1200,
    createdDaysAgo: 12, deadlineIn: 60, coverUrl: COVERS.castracao,
    title: 'Mutirão de castração do bairro',
    description: 'Castração gratuita de 50 cães e gatos de famílias de baixa renda, para reduzir o número de filhotes abandonados nas ruas da cidade.',
  },
  {
    id: 8, ngoId: 4, category: 'HEALTH', isUrgent: false, goalAmount: 1500, raised: 300,
    createdDaysAgo: 9, deadlineIn: null, coverUrl: COVERS.idoso,
    title: 'Fraldas e remédios para os idosos',
    description: 'Oito cães idosos do abrigo precisam de fraldas geriátricas e medicação para artrose todos os meses.',
  },
  {
    id: 9, ngoId: 5, category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 20000, raised: 4300,
    createdDaysAgo: 50, deadlineIn: 90, coverUrl: COVERS.gatil,
    title: 'Ampliação do gatil',
    description: 'Construção de uma nova ala no gatil, com área de quarentena separada para os gatos recém-resgatados.',
  },
  {
    id: 10, ngoId: 1, category: 'FOOD', isUrgent: false, goalAmount: 1200, raised: 0,
    createdDaysAgo: 0, deadlineIn: null, coverUrl: COVERS.filhotes,
    title: 'Ração especial para filhotes',
    description: 'Campanha recém-lançada: ração para filhotes e leite em pó para a ninhada de 9 cachorrinhos que chegou nesta semana.',
  },
  {
    id: 11, ngoId: 4, category: 'HEALTH', isUrgent: true, goalAmount: 2800, raised: 1900,
    createdDaysAgo: 4, deadlineIn: 25, coverUrl: COVERS.fisio,
    title: 'Fisioterapia para o Duke',
    description: 'Duke perdeu os movimentos das patas traseiras e está reaprendendo a andar. Precisamos de 20 sessões de fisioterapia e hidroterapia.',
  },
  {
    id: 12, ngoId: 4, category: 'FOOD', isUrgent: false, goalAmount: 3000, raised: 3400,
    createdDaysAgo: 70, deadlineIn: null, closedDaysAgo: 20, coverUrl: COVERS.racao,
    title: 'Ração para o fim de ano',
    description: 'Campanha encerrada pela ONG: a meta foi batida e a ração garantiu os meses de dezembro e janeiro.',
  },
  {
    id: 13, ngoId: 5, category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 4000, raised: 2100,
    createdDaysAgo: 60, deadlineIn: -3, coverUrl: COVERS.cobertor,
    title: 'Casinhas para o inverno passado',
    description: 'O prazo desta campanha já venceu: ela aparece como encerrada, mesmo sem a ONG ter encerrado manualmente.',
  },
]

// Doadores fictícios com ids altos, para não coincidir com contas reais
const DONOR_NAMES = [
  'Ana Beatriz Rocha', 'Bruno Carvalho', 'Camila Duarte', 'Diego Fernandes', 'Elisa Gomes', 'Felipe Hoffmann',
  'Gabriela Inácio', 'Henrique Jung', 'Isabela Klein', 'João Vitor Lopes', 'Larissa Machado', 'Mateus Nascimento',
  'Natália Oliveira', 'Otávio Pereira', 'Paula Quadros', 'Rodrigo Ribeiro', 'Sabrina Teixeira', 'Tiago Uliano',
]
const DONOR_PHOTOS = mockPublicProfiles
  .filter((profile) => profile.userType === 'PESSOA' && profile.photoUrl)
  .map((profile) => profile.photoUrl)

const DONORS = DONOR_NAMES.map((name, index) => ({
  id: 9101 + index,
  name,
  photoUrl: DONOR_PHOTOS[index] ?? null,
}))

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

function ngoSnapshot(ngoId) {
  const profile = mockPublicProfiles.find((p) => p.id === ngoId)
  return {
    id: profile.id,
    name: profile.name,
    isVerified: Boolean(profile.isVerified),
    photoUrl: profile.photoUrl ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
  }
}

function timeOf(index) {
  return `${String(8 + (index % 13)).padStart(2, '0')}:${index % 2 ? '40' : '15'}:00`
}

export function buildSeedCampanhas() {
  const today = todayLocalIso()
  const campaigns = []
  const donations = []

  CAMPAIGNS.forEach(({ ngoId, raised, createdDaysAgo, deadlineIn, closedDaysAgo, ...fields }) => {
    const createdDay = addDaysIso(today, -createdDaysAgo)
    const campaign = {
      ...fields,
      deadline: deadlineIn == null ? null : addDaysIso(today, deadlineIn),
      // Prazo vencido continua ACTIVE no banco: o encerramento é calculado na leitura
      status: closedDaysAgo == null ? 'ACTIVE' : 'CLOSED',
      createdAt: `${createdDay}T09:30:00`,
      closedAt: closedDaysAgo == null ? null : `${addDaysIso(today, -closedDaysAgo)}T18:00:00`,
      deleted: false,
      ngo: ngoSnapshot(ngoId),
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
