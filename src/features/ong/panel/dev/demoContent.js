import { addDaysIso, todayLocalIso } from '../../../../core/utils/localDate'

// 🔴 Conteúdo dos dados de teste do painel (só em dev, ver demoData.js).
// Datas e prazos relativos a hoje: a API recusa os que já passaram

function unsplash(id, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
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

// `finalStatus`: como cada um termina. O gerador marca os adotados direto
// (PATCH /animals/{id}/status), já que não há pedidos de demonstração
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

// ---------- eventos (cadastrados de verdade pela API) ----------

// Só próximos: a API recusa data no passado. Presenças não dá para criar
// (cada uma é de uma conta de verdade)
const EVENT_TEMPLATES = [
  {
    daysFromToday: 3, category: 'ADOPTION_FAIR', title: 'Feira de Adoção no Parque', startTime: '09:00', endTime: '15:00',
    capacity: null, coverUrl: unsplash('photo-1548199973-03cce0bbc87b'),
    description: 'Cães e gatos resgatados pela ONG, todos vacinados e castrados, esperando uma família. Traga documento com foto e comprovante de residência.',
  },
  {
    daysFromToday: 12, category: 'HEALTH', title: 'Mutirão de Vacinação', startTime: '08:00', endTime: '12:00',
    capacity: 30, coverUrl: unsplash('photo-1543466835-00a7907e9de1'),
    description: 'Vacina antirrábica e V10 a preço de custo para cães e gatos da comunidade. Vagas limitadas à equipe veterinária.',
  },
  {
    daysFromToday: 26, category: 'WORKSHOP', title: 'Oficina: os primeiros dias com o pet adotado', startTime: '19:00', endTime: '21:00',
    capacity: 20, coverUrl: null,
    description: 'Adaptação, alimentação, primeiros cuidados veterinários e como lidar com o medo do novo lar. Aberta para quem adotou ou pretende adotar.',
  },
]

// Corpos de POST /events: eventos na sede da ONG (cidade do perfil)
export function buildDemoEvents(user) {
  const today = todayLocalIso()
  const place = {
    venueName: 'Sede da ONG', cep: null, street: 'Rua das Acácias', number: '120', complement: null, district: 'Centro',
    city: user.address?.city || user.city || 'Criciúma', state: user.address?.state || user.state || 'SC',
  }

  return EVENT_TEMPLATES.map(({ daysFromToday, ...fields }) => ({
    ...fields,
    ...place,
    customCategory: null,
    date: addDaysIso(today, daysFromToday),
  }))
}

// ---------- campanhas (cadastradas de verdade pela API) ----------

// Sem doações: cada uma é um PIX de verdade. `close`: o gerador encerra a
// campanha logo depois de criar (POST /campaigns/{id}/close)
const CAMPAIGN_TEMPLATES = [
  {
    title: 'Castração de 20 gatos do abrigo', category: 'HEALTH', isUrgent: true, goalAmount: 6000,
    deadlineIn: 5, coverUrl: unsplash('photo-1514888286974-6c03e2ca1dba'),
    description: 'O abrigo recebeu uma colônia de gatos de um terreno baldio. Castrar todos evita novas ninhadas nas ruas e é o primeiro passo para a adoção.',
  },
  {
    title: 'Ração para o inverno', category: 'FOOD', isUrgent: false, goalAmount: 3000,
    deadlineIn: null, coverUrl: null,
    description: 'No frio os animais comem mais. A meta garante ração para os 60 cães e gatos do abrigo até o fim do inverno.',
  },
  {
    title: 'Reforma do canil', category: 'INFRASTRUCTURE', isUrgent: false, goalAmount: 12000,
    deadlineIn: 40, coverUrl: unsplash('photo-1587300003388-59208cc962cb'),
    description: 'Telhado novo, piso aquecido e baias maiores para os cães de grande porte. A obra começa quando a meta for atingida.',
  },
  {
    title: 'Cirurgia da Pipoca', category: 'HEALTH', isUrgent: false, goalAmount: 2500, close: true,
    deadlineIn: null, coverUrl: unsplash('photo-1583512603805-3cc6b41f3edb'),
    description: 'A Pipoca precisou operar a pata traseira. A cirurgia deu certo, a campanha foi encerrada e ela já foi adotada.',
  },
]

// [{ payload, close }]: `payload` é o corpo de POST /campaigns
export function buildDemoCampaigns() {
  const today = todayLocalIso()

  return CAMPAIGN_TEMPLATES.map(({ deadlineIn, close = false, ...fields }) => ({
    payload: {
      ...fields,
      customCategory: null,
      deadline: deadlineIn == null ? null : addDaysIso(today, deadlineIn),
    },
    close,
  }))
}
