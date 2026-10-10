import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'
import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'

// 🔴 Seed do banco falso de eventos (eventosMock.js). As datas são relativas
// ao dia em que o seed roda, então a vitrine nunca "envelhece" — o mock
// antigo tinha datas fixas e /eventos acabou vazio. Organizadores são as
// ONGs 1, 4 e 5 de mockPublicProfiles, e o seed cobre todos os estados:
// hoje, fim de semana, lotado, quase lotado, sem fim, sem capa, passado e
// cancelado

// Toda conta que abre o app no mock ganha presença nestes dois (um que já
// aconteceu e um cancelado): não dá para confirmar presença em evento
// passado, então sem isso "Já participou" nunca teria o que mostrar
export const DEMO_ATTENDANCE_EVENT_IDS = [14, 16]

const COVERS = {
  feira: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
  gatos: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
  castracao: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=80',
  vacina: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
  socorros: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&w=1200&q=80',
  adestramento: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1200&q=80',
  bazar: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=80',
}

const PLACES = {
  araPraca: {
    venueName: 'Praça Hercílio Luz', cep: '88900000', street: 'Rua Coronel Apolinário Pereira',
    number: null, complement: null, district: 'Centro', city: 'Araranguá', state: 'SC',
  },
  araSede: {
    venueName: 'Sede Patinhas Carentes', cep: '88905000', street: 'Rua Caetano Lummertz',
    number: '850', complement: 'Portão lateral', district: 'Cidade Alta', city: 'Araranguá', state: 'SC',
  },
  araGinasio: {
    venueName: 'Ginásio Municipal de Esportes', cep: '88900000', street: 'Avenida Sete de Setembro',
    number: '1200', complement: null, district: 'Centro', city: 'Araranguá', state: 'SC',
  },
  cricParque: {
    venueName: 'Parque Centenário', cep: '88801000', street: 'Avenida Centenário',
    number: null, complement: null, district: 'Centro', city: 'Criciúma', state: 'SC',
  },
  cricPraca: {
    venueName: 'Praça Nereu Ramos', cep: '88801000', street: 'Rua Coronel Pedro Benedet',
    number: null, complement: null, district: 'Centro', city: 'Criciúma', state: 'SC',
  },
  cricEspaco: {
    venueName: 'Espaço Pet Amigo', cep: null, street: 'Rua Henrique Lage',
    number: '315', complement: 'Sala 2', district: 'Centro', city: 'Criciúma', state: 'SC',
  },
  tubUbs: {
    venueName: 'UBS Central', cep: '88701000', street: 'Rua Lauro Müller',
    number: '120', complement: null, district: 'Centro', city: 'Tubarão', state: 'SC',
  },
  tubPraca: {
    venueName: 'Praça Sete de Setembro', cep: '88701000', street: 'Rua Sete de Setembro',
    number: null, complement: null, district: 'Centro', city: 'Tubarão', state: 'SC',
  },
  icaGinasio: {
    venueName: 'Ginásio Municipal', cep: '88820000', street: 'Rua Marechal Floriano',
    number: '500', complement: null, district: 'Centro', city: 'Içara', state: 'SC',
  },
}

// dayOffset: dias a partir de hoje; 'SATURDAY' = o próximo sábado, calculado
// igual ao filtro "Este fim de semana" (matchesPeriod)
const EVENTS = [
  {
    id: 1, ngoId: 1, dayOffset: 'SATURDAY', category: 'ADOPTION_FAIR', place: 'araPraca', coverUrl: COVERS.feira,
    title: 'Feira de Adoção de Primavera', startTime: '09:00', endTime: '16:00', capacity: null, confirmed: 18,
    description: 'Mais de 40 cães e gatos resgatados, todos vacinados, vermifugados e castrados, esperando uma família. Traga documento com foto e comprovante de residência para agilizar a adoção.',
  },
  {
    id: 2, ngoId: 5, dayOffset: 3, category: 'HEALTH', place: 'tubUbs', coverUrl: COVERS.castracao,
    title: 'Mutirão de Castração Gratuita', startTime: '08:00', endTime: '12:00', capacity: 20, confirmed: 20,
    description: 'Castração gratuita de cães e gatos para famílias de baixa renda. O animal precisa estar em jejum de 8 horas. Vagas limitadas à capacidade da equipe veterinária.',
  },
  {
    id: 3, ngoId: 4, dayOffset: 5, category: 'WORKSHOP', place: 'cricEspaco', coverUrl: COVERS.socorros,
    title: 'Workshop: Primeiros Socorros Pet', startTime: '14:00', endTime: '17:00', capacity: 15, confirmed: 13,
    description: 'Uma médica-veterinária ensina o que fazer em engasgos, cortes, intoxicações e golpes de calor até chegar à clínica. Aula prática com bonecos de treino.',
  },
  {
    id: 4, ngoId: 4, dayOffset: 12, category: 'BAZAAR', place: 'cricParque', coverUrl: COVERS.bazar,
    title: 'Bazar Beneficente Amigo Fiel', startTime: '10:00', endTime: '18:00', capacity: null, confirmed: 6,
    description: 'Roupas, acessórios e produtos pet doados pela comunidade. Toda a renda vai para o tratamento dos animais do abrigo.',
  },
  {
    id: 5, ngoId: 1, dayOffset: 9, category: 'ADOPTION_FAIR', place: 'araSede', coverUrl: COVERS.gatos,
    title: 'Feira de Adoção de Gatinhos', startTime: '13:00', endTime: '17:00', capacity: null, confirmed: 4,
    description: 'Filhotes e adultos resgatados, testados para FIV/FeLV e prontos para um lar com janelas teladas. Conversamos com cada família antes da adoção.',
  },
  {
    id: 6, ngoId: 5, dayOffset: 16, category: 'HEALTH', place: 'icaGinasio', coverUrl: COVERS.vacina,
    title: 'Mutirão de Vacinação Antirrábica', startTime: '08:00', endTime: '15:00', capacity: 80, confirmed: 9,
    description: 'Vacina antirrábica gratuita para cães e gatos a partir de 3 meses. Traga a carteirinha de vacinação, se tiver. Cães na guia e gatos na caixa de transporte.',
  },
  {
    id: 7, ngoId: 1, dayOffset: 20, category: 'WORKSHOP', place: 'araSede', coverUrl: COVERS.adestramento,
    title: 'Workshop: Adestramento Positivo', startTime: '15:00', endTime: '18:00', capacity: 25, confirmed: 3,
    description: 'Técnicas de adestramento com reforço positivo para quem acabou de adotar: guia, chamado, xixi no lugar certo e ansiedade de separação.',
  },
  {
    id: 8, ngoId: 4, dayOffset: 26, category: 'ADOPTION_FAIR', place: 'cricParque', coverUrl: COVERS.feira,
    title: 'Feira Pet no Parque', startTime: '09:00', endTime: '13:00', capacity: null, confirmed: 0,
    description: 'Manhã de adoção ao ar livre com os cães do Abrigo Amigo Fiel. Venha conhecer, passear com eles e tirar dúvidas com os voluntários.',
  },
  {
    id: 9, ngoId: 5, dayOffset: 33, category: 'HEALTH', place: 'tubPraca', coverUrl: COVERS.vacina,
    title: 'Mutirão de Vermifugação', startTime: '09:00', endTime: null, capacity: 60, confirmed: 2,
    description: 'Vermífugo gratuito para cães e gatos, com orientação sobre a frequência certa para cada idade. Atendimento por ordem de chegada enquanto houver doses.',
  },
  {
    id: 10, ngoId: 1, dayOffset: 41, category: 'BAZAAR', place: 'araGinasio', coverUrl: COVERS.bazar,
    title: 'Bazar Solidário de Verão', startTime: '10:00', endTime: '16:00', capacity: null, confirmed: 0,
    description: 'Moda praia, brinquedos e artigos para casa a preços simbólicos. O dinheiro arrecadado paga as castrações do próximo trimestre.',
  },
  {
    id: 11, ngoId: 4, dayOffset: 48, category: 'WORKSHOP', place: 'cricEspaco', coverUrl: null,
    title: 'Workshop: Nutrição e Bem-Estar', startTime: '19:00', endTime: '21:00', capacity: 30, confirmed: 1,
    description: 'Ração, alimentação natural e petiscos: o que muda em cada fase da vida do animal. Com espaço para perguntas ao final.',
  },
  {
    id: 12, ngoId: 5, dayOffset: 55, category: 'ADOPTION_FAIR', place: 'tubPraca', coverUrl: COVERS.gatos,
    title: 'Feira de Adoção de Fim de Ano', startTime: '09:00', endTime: '17:00', capacity: null, confirmed: 0,
    description: 'A última feira do ano da ONG Patas Unidas, com cães e gatos de todas as idades. Adoção responsável: nenhum animal sai como presente surpresa.',
  },
  {
    id: 13, ngoId: 1, dayOffset: 0, category: 'ADOPTION_FAIR', place: 'cricPraca', coverUrl: COVERS.feira,
    title: 'Plantão de Adoção na Praça', startTime: '14:00', endTime: '18:00', capacity: null, confirmed: 5,
    description: 'Plantão rápido com os animais mais antigos do abrigo, que esperam há mais tempo por uma família.',
  },
  {
    id: 14, ngoId: 1, dayOffset: -12, category: 'ADOPTION_FAIR', place: 'araPraca', coverUrl: COVERS.feira,
    title: 'Feira de Adoção de Inverno', startTime: '09:00', endTime: '15:00', capacity: null, confirmed: 7,
    description: 'Feira que já aconteceu — 23 animais foram adotados neste dia.',
  },
  {
    id: 15, ngoId: 5, dayOffset: -30, category: 'HEALTH', place: 'tubUbs', coverUrl: COVERS.castracao,
    title: 'Mutirão de Castração de Agosto', startTime: '08:00', endTime: '12:00', capacity: 20, confirmed: 12,
    description: 'Mutirão que já aconteceu, com 12 animais castrados.',
  },
  {
    id: 16, ngoId: 4, dayOffset: 8, category: 'BAZAAR', place: 'cricPraca', coverUrl: COVERS.bazar, status: 'CANCELLED',
    title: 'Bazar do Dia dos Animais', startTime: '10:00', endTime: '17:00', capacity: null, confirmed: 3,
    description: 'Evento cancelado pela ONG — só aparece em Minha conta, para quem tinha confirmado presença.',
  },
]

// Participantes fictícios com ids altos, para não coincidir com contas reais
const ATTENDEE_NAMES = [
  'Ana Beatriz Rocha', 'Bruno Carvalho', 'Camila Duarte', 'Diego Fernandes', 'Elisa Gomes', 'Felipe Hoffmann',
  'Gabriela Inácio', 'Henrique Jung', 'Isabela Klein', 'João Vitor Lopes', 'Larissa Machado', 'Mateus Nascimento',
  'Natália Oliveira', 'Otávio Pereira', 'Paula Quadros', 'Rodrigo Ribeiro', 'Sabrina Teixeira', 'Tiago Uliano',
  'Vanessa Vieira', 'William Zanette', 'Yasmin Borges', 'Lucas Cardoso',
]
const ATTENDEE_PHOTOS = mockPublicProfiles
  .filter((profile) => profile.userType === 'PESSOA' && profile.photoUrl)
  .map((profile) => profile.photoUrl)

const ATTENDEES = ATTENDEE_NAMES.map((name, index) => ({
  id: 9001 + index,
  name,
  photoUrl: ATTENDEE_PHOTOS[index] ?? null,
}))

function ngoSnapshot(ngoId) {
  const profile = mockPublicProfiles.find((p) => p.id === ngoId)
  return { id: profile.id, name: profile.name, isVerified: Boolean(profile.isVerified), photoUrl: profile.photoUrl ?? null }
}

function buildAttendance(event, count, today) {
  // Confirmações nos dias anteriores ao evento (ou a hoje, se ele ainda vai acontecer)
  const lastDay = event.date < today ? event.date : today
  return Array.from({ length: count }, (_, index) => ({
    eventId: event.id,
    user: ATTENDEES[(event.id * 5 + index) % ATTENDEES.length],
    confirmedAt: `${addDaysIso(lastDay, -1 - (index % 10))}T${String(8 + (index % 12)).padStart(2, '0')}:${index % 2 ? '30' : '05'}:00`,
  }))
}

export function buildSeedEventos() {
  const today = todayLocalIso()
  const saturdayOffset = (6 - new Date().getDay() + 7) % 7

  const events = []
  const attendances = []

  EVENTS.forEach(({ ngoId, dayOffset, place, confirmed, status, ...fields }) => {
    const event = {
      ...fields,
      date: addDaysIso(today, dayOffset === 'SATURDAY' ? saturdayOffset : dayOffset),
      ...PLACES[place],
      status: status ?? 'ACTIVE',
      createdAt: `${addDaysIso(today, -40)}T09:30:00`,
      ngo: ngoSnapshot(ngoId),
    }
    events.push(event)
    attendances.push(...buildAttendance(event, confirmed, today))
  })

  return { events, attendances, demoAttendanceUserIds: [] }
}
