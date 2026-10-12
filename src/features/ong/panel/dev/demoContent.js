import { addDaysIso, todayLocalIso } from '../../../../core/utils/localDate'
import { mockPublicProfiles } from '../../../perfil/data/mockPublicProfiles'

// 🔴 Conteúdo dos dados de teste do painel (só em dev, ver demoData.js).
// Datas relativas a hoje, para os gráficos dos últimos meses terem o que mostrar

function unsplash(id, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}

function daysAgoAt(days, time) {
  return `${addDaysIso(todayLocalIso(), -days)}T${time}:00`
}

// ---------- animais (cadastrados de verdade pela API) ----------

const BASE_FORM = {
  breed: 'SRD',
  vaccinated: true,
  neutered: true,
  dewormed: true,
  specialNeeds: false,
  energyLevel: 'MODERATE',
  temperament: 'AFFECTIONATE',
  independenceLevel: 'MODERATE',
  vocalization: 'LOW',
  goodWithChildren: true,
  goodWithDogs: true,
  goodWithCats: false,
  apartmentFriendly: true,
}

// `finalStatus`: como cada um termina. Os adotados viram ADOPTED pela
// sincronização do dono (useSyncAdoptedAnimals) quando a página recarrega
export const DEMO_ANIMALS = [
  {
    key: 'thor',
    finalStatus: 'AVAILABLE',
    photos: [unsplash('photo-1552053831-71594a27632d')],
    form: {
      ...BASE_FORM, name: 'Thor', species: 'DOG', sex: 'MALE', ageValue: 3, ageUnit: 'YEARS', size: 'MEDIUM',
      energyLevel: 'HIGH', temperament: 'PLAYFUL', apartmentFriendly: false,
      summary: 'Brincalhão e cheio de energia: adora correr, buscar a bolinha e receber visitas.',
      story: 'O Thor chegou à ONG ainda filhote, depois de ser encontrado perto de uma obra. Cresceu cercado de voluntários e hoje é o animador do canil. Precisa de uma casa com espaço e de alguém que goste de passear.',
    },
  },
  {
    key: 'luna',
    finalStatus: 'AVAILABLE',
    photos: [unsplash('photo-1573865526739-10659fec78a5')],
    form: {
      ...BASE_FORM, name: 'Luna', species: 'CAT', sex: 'FEMALE', ageValue: 8, ageUnit: 'MONTHS', size: 'SMALL',
      temperament: 'CALM', goodWithDogs: false, goodWithCats: true,
      summary: 'Gatinha tranquila e carinhosa, perfeita para apartamento.',
      story: 'A Luna foi resgatada com os irmãos numa caixa de papelão. Os irmãos já foram adotados e ela segue esperando a família dela. Gosta de janela, de colo no fim da tarde e de brinquedos com pena.',
    },
  },
  {
    key: 'bento',
    finalStatus: 'AVAILABLE',
    photos: [unsplash('photo-1583511655857-d19b40a7a54e')],
    form: {
      ...BASE_FORM, name: 'Bento', species: 'DOG', sex: 'MALE', ageValue: 1, ageUnit: 'YEARS', size: 'LARGE',
      energyLevel: 'HIGH', temperament: 'PROTECTIVE', apartmentFriendly: false,
      summary: 'Grandão e protetor, mas um doce com as crianças.',
      story: 'O Bento vivia preso numa corrente curta até a denúncia de um vizinho. Na ONG aprendeu a passear de guia e a confiar nas pessoas. Vai ser o melhor amigo de uma família com quintal.',
    },
  },
  {
    key: 'mel',
    finalStatus: 'AVAILABLE',
    photos: [unsplash('photo-1543466835-00a7907e9de1')],
    form: {
      ...BASE_FORM, name: 'Mel', species: 'DOG', sex: 'FEMALE', ageValue: 5, ageUnit: 'YEARS', size: 'SMALL',
      energyLevel: 'LOW', temperament: 'AFFECTIONATE', goodWithCats: true,
      summary: 'Calma, companheira e apaixonada por colo.',
      story: 'A Mel foi entregue à ONG quando a antiga tutora precisou se mudar para um lugar que não aceitava animais. É educada, usa o tapetinho e se adapta fácil a qualquer rotina tranquila.',
    },
  },
  {
    key: 'pipoca',
    finalStatus: 'ADOPTED',
    photos: [unsplash('photo-1583512603805-3cc6b41f3edb')],
    form: {
      ...BASE_FORM, name: 'Pipoca', species: 'DOG', breed: 'Buldogue francês', sex: 'FEMALE', ageValue: 2, ageUnit: 'YEARS',
      size: 'SMALL', temperament: 'PLAYFUL', goodWithCats: true,
      summary: 'Pequena, sapeca e muito sociável.',
      story: 'A Pipoca chegou com uma lesão na pata que precisou de cirurgia, paga com uma campanha da ONG. Recuperada, virou a alegria do abrigo até encontrar a família dela.',
    },
  },
  {
    key: 'frida',
    finalStatus: 'ADOPTED',
    photos: [unsplash('photo-1592194996308-7b43878e84a6')],
    form: {
      ...BASE_FORM, name: 'Frida', species: 'CAT', sex: 'FEMALE', ageValue: 3, ageUnit: 'YEARS', size: 'MEDIUM',
      temperament: 'INDEPENDENT', independenceLevel: 'HIGH', goodWithDogs: false, goodWithCats: true,
      summary: 'Independente e elegante, carinhosa quando quer.',
      story: 'A Frida morava num estacionamento e era alimentada pelos funcionários, que pediram ajuda à ONG quando ela apareceu ferida. Depois do tratamento, mostrou que adora uma casa sossegada.',
    },
  },
  {
    key: 'nino',
    finalStatus: 'AVAILABLE',
    photos: [unsplash('photo-1452857297128-d9c29adba80b'), unsplash('photo-1535241749838-299277b6305f')],
    form: {
      ...BASE_FORM, name: 'Nino', species: 'OTHER', breed: 'Coelho mini lop', sex: 'MALE', ageValue: 1, ageUnit: 'YEARS',
      size: 'SMALL', energyLevel: 'LOW', temperament: 'CALM', goodWithDogs: false,
      summary: 'Coelho dócil, acostumado com gente e com cercadinho.',
      story: 'O Nino foi abandonado numa praça depois da Páscoa. É calmo, come feno e verduras e gosta de passear solto pela sala, sempre com supervisão.',
    },
  },
  {
    key: 'cafe',
    finalStatus: 'INACTIVE',
    photos: [unsplash('photo-1587300003388-59208cc962cb')],
    form: {
      ...BASE_FORM, name: 'Café', species: 'DOG', sex: 'MALE', ageValue: 9, ageUnit: 'YEARS', size: 'MEDIUM',
      energyLevel: 'LOW', temperament: 'CALM', specialNeeds: true,
      summary: 'Idoso carinhoso, em tratamento: volta para a vitrine quando receber alta.',
      story: 'O Café é o veterano da ONG. Está tratando uma artrose e, por enquanto, fica fora da vitrine. Quando receber alta, vai procurar um lar calmo para curtir a melhor idade.',
    },
  },
]

// ---------- pessoas fictícias (ids altos, para não coincidir com contas reais) ----------

const PERSON_PHOTOS = [
  unsplash('photo-1544005313-94ddf0286df2', 200),
  unsplash('photo-1500648767791-00dcc994a43e', 200),
  unsplash('photo-1534528741775-53994a69daeb', 200),
  ...mockPublicProfiles.filter((profile) => profile.userType === 'PESSOA' && profile.photoUrl).map((profile) => profile.photoUrl),
]

function photoFor(index) {
  return PERSON_PHOTOS[index % PERSON_PHOTOS.length] ?? null
}

const ADOPTER_LIST = [
  ['camila', 'Camila Rodrigues', 'Criciúma', 90, 'Casa com quintal · Rotina ativa · Sem outros pets'],
  ['lucas', 'Lucas Ferreira', 'Araranguá', 65, 'Apartamento · Rotina moderada · Já tem outro cão'],
  ['pedro', 'Pedro Henrique Souza', 'Içara', 40, 'Apartamento · Pouco tempo em casa'],
  ['beatriz', 'Beatriz Martins', 'Criciúma', 100, 'Casa · Muito ativa · Tem crianças'],
  ['rafael', 'Rafael Costa', 'Criciúma', 85, 'Casa com quintal · Rotina ativa · Tem uma filha'],
  ['juliana', 'Juliana Alves', 'Forquilhinha', 95, 'Apartamento · Trabalha em casa · Sem outros pets'],
  ['mariana', 'Mariana Lopes', 'Criciúma', 100, 'Casa · Rotina tranquila · Já tem uma gata'],
  ['gustavo', 'Gustavo Pereira', 'Nova Veneza', 70, 'Casa com quintal · Rotina moderada'],
  ['fernanda', 'Fernanda Dias', 'Içara', 80, 'Apartamento · Rotina tranquila · Sem outros pets'],
]

export const DEMO_ADOPTERS = Object.fromEntries(
  ADOPTER_LIST.map(([key, name, city, profileCompletion, lifestyleSummary], index) => [
    key,
    { userId: null, name, photoUrl: photoFor(index), city, state: 'SC', profileCompletion, lifestyleSummary },
  ])
)

const EXTRA_NAMES = [
  'Ana Clara Bitencourt', 'Bruno Zanette', 'Carla Mendes', 'Daniel Fabris', 'Eduarda Rosso', 'Fábio Cardoso',
  'Giovana Pizzetti', 'Hugo Medeiros', 'Isadora Coral', 'Jonas Bez', 'Karina Freitas', 'Leonardo Damiani',
  'Manuela Ghislandi', 'Nicolas Back', 'Olívia Feltrin', 'Patrick Dagostin', 'Renata Cechinel', 'Samuel Milanez',
  'Tatiane Bortolotto', 'Vinícius Mazzucco', 'Yasmin Ronchi', 'André Zilli', 'Bianca Costa', 'César Rampinelli',
  'Débora Just', 'Emanuel Guglielmi', 'Flávia Biff', 'Gabriel Sartor', 'Helena Conti', 'Igor Cardoso',
  'Joana Pavei', 'Lucas Minatto',
]

const EXTRA_PEOPLE = EXTRA_NAMES.map((name, index) => ({ id: 9801 + index, name, photoUrl: photoFor(index + 3) }))

// ---------- pedidos de adoção e conversas (localStorage) ----------

export const DEMO_REQUESTS = [
  { key: 'thor-camila', animal: 'thor', adopter: 'camila', status: 'PENDING', daysAgo: 4 },
  { key: 'thor-lucas', animal: 'thor', adopter: 'lucas', status: 'PENDING', daysAgo: 1 },
  { key: 'thor-pedro', animal: 'thor', adopter: 'pedro', status: 'REJECTED', daysAgo: 40 },
  { key: 'luna-beatriz', animal: 'luna', adopter: 'beatriz', status: 'PENDING', daysAgo: 2 },
  { key: 'bento-rafael', animal: 'bento', adopter: 'rafael', status: 'ACCEPTED', daysAgo: 12 },
  { key: 'mel-juliana', animal: 'mel', adopter: 'juliana', status: 'AWAITING_DELIVERY', daysAgo: 20 },
  {
    key: 'pipoca-mariana', animal: 'pipoca', adopter: 'mariana', status: 'CONCLUDED', daysAgo: 70, concludedDaysAgo: 55,
    review: { rating: 5, comment: 'Processo cuidadoso do começo ao fim. A equipe tirou todas as nossas dúvidas e a Pipoca chegou saudável e vacinada.' },
  },
  { key: 'pipoca-gustavo', animal: 'pipoca', adopter: 'gustavo', status: 'CANCELLED', daysAgo: 68 },
  {
    key: 'frida-fernanda', animal: 'frida', adopter: 'fernanda', status: 'CONCLUDED', daysAgo: 130, concludedDaysAgo: 110,
    review: { rating: 4, comment: 'Adoção tranquila e bem orientada. Só demorou um pouco para marcarmos a entrega.' },
  },
]

// `from`: 'adopter', 'ong' ou 'system'. `unread`: chega depois da última leitura da ONG
export const DEMO_CHATS = {
  'bento-rafael': [
    { from: 'adopter', daysAgo: 11, time: '19:12', text: 'Oi! Vi o Bento no site e me apaixonei. Ele se dá bem com crianças?' },
    { from: 'ong', daysAgo: 11, time: '20:03', text: 'Oi, Rafael! Se dá muito bem: é grandão, mas super dócil. Quantos anos tem sua filha?' },
    { from: 'adopter', daysAgo: 10, time: '08:40', text: 'Ela tem 7 anos e já pediu um cachorro grande de presente.' },
    { from: 'ong', daysAgo: 10, time: '09:15', text: 'Perfeito! Podemos marcar uma visita para vocês conhecerem o Bento.' },
    { from: 'adopter', daysAgo: 1, time: '18:30', text: 'Pode ser neste sábado de manhã?', unread: true },
    { from: 'adopter', daysAgo: 1, time: '18:31', text: 'Posso levar minha filha junto?', unread: true },
  ],
  'mel-juliana': [
    { from: 'adopter', daysAgo: 19, time: '10:05', text: 'Oi! A Mel ainda está disponível? Trabalho em casa e procuro uma companheira tranquila.' },
    { from: 'ong', daysAgo: 19, time: '11:20', text: 'Está sim, Juliana! Ela é calminha e adora colo. As janelas do seu apartamento têm tela?' },
    { from: 'adopter', daysAgo: 18, time: '09:02', text: 'Têm sim, e já comprei caminha e ração.' },
    { from: 'ong', daysAgo: 3, time: '16:45', text: 'Combinado, então! Levamos a Mel no sábado às 10h.' },
    {
      from: 'system', daysAgo: 3, time: '16:46',
      text: 'O doador confirmou a entrega de Mel. O chat foi bloqueado para novas mensagens — quando o pet chegar até você, confirme o recebimento para concluir a adoção.',
    },
  ],
  'pipoca-mariana': [
    { from: 'adopter', daysAgo: 69, time: '14:10', text: 'Olá! Tenho uma gata bem tranquila em casa. Acham que a Pipoca se daria bem com ela?' },
    { from: 'ong', daysAgo: 69, time: '15:00', text: 'Acreditamos que sim: ela já convive com os gatos do abrigo. Que tal uma visita?' },
    { from: 'adopter', daysAgo: 60, time: '19:30', text: 'Amamos conhecer a Pipoca! Podemos buscar na semana que vem?' },
    { from: 'system', daysAgo: 55, time: '11:00', text: 'Adoção de Pipoca concluída! Parabéns pelo novo membro da família.' },
  ],
  'frida-fernanda': [
    { from: 'adopter', daysAgo: 129, time: '20:15', text: 'Boa noite! Moro sozinha e procuro uma gata independente. A Frida é assim?' },
    { from: 'ong', daysAgo: 128, time: '09:30', text: 'É exatamente assim! Carinhosa no tempo dela. Vamos conversar sobre a adaptação?' },
    { from: 'system', daysAgo: 110, time: '17:20', text: 'Adoção de Frida concluída! Parabéns pelo novo membro da família.' },
  ],
}

export function demoMessageTime({ daysAgo, time }) {
  return daysAgoAt(daysAgo, time)
}

export function demoRequestDates({ daysAgo, concludedDaysAgo }) {
  return {
    createdAt: daysAgoAt(daysAgo, '10:30'),
    concludedAt: concludedDaysAgo == null ? null : daysAgoAt(concludedDaysAgo, '11:00'),
    reviewedAt: concludedDaysAgo == null ? null : daysAgoAt(Math.max(concludedDaysAgo - 2, 0), '20:00'),
  }
}

// ---------- eventos e campanhas (mocks no localStorage) ----------

const EVENT_TEMPLATES = [
  {
    daysFromToday: 3, attendees: 14, category: 'ADOPTION_FAIR', title: 'Feira de Adoção no Parque', startTime: '09:00', endTime: '15:00',
    capacity: null, coverUrl: unsplash('photo-1548199973-03cce0bbc87b'),
    description: 'Cães e gatos resgatados pela ONG, todos vacinados e castrados, esperando uma família. Traga documento com foto e comprovante de residência.',
  },
  {
    daysFromToday: 12, attendees: 22, category: 'HEALTH', title: 'Mutirão de Vacinação', startTime: '08:00', endTime: '12:00',
    capacity: 30, coverUrl: unsplash('photo-1543466835-00a7907e9de1'),
    description: 'Vacina antirrábica e V10 a preço de custo para cães e gatos da comunidade. Vagas limitadas à equipe veterinária.',
  },
  {
    daysFromToday: 26, attendees: 6, category: 'WORKSHOP', title: 'Oficina: os primeiros dias com o pet adotado', startTime: '19:00', endTime: '21:00',
    capacity: 20, coverUrl: null,
    description: 'Adaptação, alimentação, primeiros cuidados veterinários e como lidar com o medo do novo lar. Aberta para quem adotou ou pretende adotar.',
  },
  {
    daysFromToday: -18, attendees: 31, category: 'BAZAAR', title: 'Bazar Beneficente de Inverno', startTime: '10:00', endTime: '17:00',
    capacity: null, coverUrl: unsplash('photo-1607083206968-13611e3d76db'),
    description: 'Roupas, livros e utensílios doados pela comunidade. Toda a renda vai para a ração do inverno.',
  },
  {
    daysFromToday: -80, attendees: 26, category: 'ADOPTION_FAIR', title: 'Feira de Adoção de Outono', startTime: '09:00', endTime: '16:00',
    capacity: null, coverUrl: unsplash('photo-1548199973-03cce0bbc87b'),
    description: 'Edição de outono da feira de adoção da ONG, com orientação de veterinários voluntários.',
  },
]

// Eventos na sede da ONG (cidade do perfil). As presenças são confirmadas
// nos dias antes do evento — ou antes de hoje, se ele ainda vai acontecer
export function buildDemoEvents(user) {
  const today = todayLocalIso()
  const place = {
    venueName: 'Sede da ONG', cep: null, street: 'Rua das Acácias', number: '120', complement: null, district: 'Centro',
    city: user.address?.city || user.city || 'Criciúma', state: user.address?.state || user.state || 'SC',
  }

  return EVENT_TEMPLATES.map(({ daysFromToday, attendees, ...fields }, index) => {
    const date = addDaysIso(today, daysFromToday)
    const lastDay = daysFromToday < 0 ? date : today
    return {
      ...fields,
      ...place,
      date,
      createdAt: `${addDaysIso(lastDay, -(15 + index * 4))}T10:00:00`,
      attendees: EXTRA_PEOPLE.slice(0, attendees).map((person, personIndex) => ({
        user: person,
        confirmedAt: `${addDaysIso(lastDay, -1 - (personIndex % 9))}T${String(8 + (personIndex % 12)).padStart(2, '0')}:20:00`,
      })),
    }
  })
}

const CAMPAIGN_TEMPLATES = [
  {
    title: 'Castração de 20 gatos do abrigo', category: 'HEALTH', isUrgent: true, goalAmount: 6000, raised: 4180,
    createdDaysAgo: 50, deadlineIn: 5, coverUrl: unsplash('photo-1514888286974-6c03e2ca1dba'),
    description: 'O abrigo recebeu uma colônia de gatos de um terreno baldio. Castrar todos evita novas ninhadas nas ruas e é o primeiro passo para a adoção.',
  },
  {
    title: 'Ração para o inverno', category: 'FOOD', isUrgent: false, goalAmount: 3000, raised: 2735,
    createdDaysAgo: 160, deadlineIn: null, coverUrl: null,
    description: 'No frio os animais comem mais. A meta garante ração para os 60 cães e gatos do abrigo até o fim do inverno.',
  },
  {
    title: 'Reforma do canil', category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 12000, raised: 5120,
    createdDaysAgo: 95, deadlineIn: 40, coverUrl: unsplash('photo-1587300003388-59208cc962cb'),
    description: 'Telhado novo, piso aquecido e baias maiores para os cães de grande porte. A obra começa quando a meta for atingida.',
  },
  {
    title: 'Cirurgia da Pipoca', category: 'HEALTH', isUrgent: false, goalAmount: 2500, raised: 2650,
    createdDaysAgo: 125, closedDaysAgo: 75, deadlineIn: null, coverUrl: unsplash('photo-1583512603805-3cc6b41f3edb'),
    description: 'A Pipoca precisou operar a pata traseira. A campanha bateu a meta, a cirurgia deu certo e ela já foi adotada.',
  },
]

const AMOUNT_CYCLE = [50, 100, 25, 200, 30, 80, 15, 150, 60, 300, 40, 120]

// O último pedaço completa o total exato, sem ficar abaixo da doação mínima
function splitIntoDonations(total) {
  const amounts = []
  let rest = total
  for (let index = 0; rest > 0; index += 1) {
    const amount = AMOUNT_CYCLE[index % AMOUNT_CYCLE.length]
    const next = rest - amount < 5 ? rest : Math.min(amount, rest)
    amounts.push(next)
    rest -= next
  }
  return amounts
}

// Doações espalhadas entre a criação e o fim da campanha (ou ontem)
export function buildDemoCampaigns() {
  const today = todayLocalIso()

  return CAMPAIGN_TEMPLATES.map(({ raised, createdDaysAgo, closedDaysAgo, deadlineIn, ...fields }, campaignIndex) => {
    const lastDaysAgo = closedDaysAgo ?? 1
    const amounts = splitIntoDonations(raised)
    const step = (createdDaysAgo - lastDaysAgo) / amounts.length

    return {
      ...fields,
      deadline: deadlineIn == null ? null : addDaysIso(today, deadlineIn),
      status: closedDaysAgo == null ? 'ACTIVE' : 'CLOSED',
      createdAt: daysAgoAt(createdDaysAgo, '09:30'),
      closedAt: closedDaysAgo == null ? null : daysAgoAt(closedDaysAgo, '18:00'),
      donations: amounts.map((amount, index) => ({
        amount,
        approvedAt: daysAgoAt(Math.round(createdDaysAgo - step * (index + 0.5)), `${String(9 + (index % 11)).padStart(2, '0')}:40`),
        donor: EXTRA_PEOPLE[(campaignIndex * 7 + index) % EXTRA_PEOPLE.length],
      })),
    }
  })
}
