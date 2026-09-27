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
    localNome: 'Praça Hercílio Luz', cep: '88900000', logradouro: 'Rua Coronel Apolinário Pereira',
    numero: null, complemento: null, bairro: 'Centro', cidade: 'Araranguá', estado: 'SC',
  },
  araSede: {
    localNome: 'Sede Patinhas Carentes', cep: '88905000', logradouro: 'Rua Caetano Lummertz',
    numero: '850', complemento: 'Portão lateral', bairro: 'Cidade Alta', cidade: 'Araranguá', estado: 'SC',
  },
  araGinasio: {
    localNome: 'Ginásio Municipal de Esportes', cep: '88900000', logradouro: 'Avenida Sete de Setembro',
    numero: '1200', complemento: null, bairro: 'Centro', cidade: 'Araranguá', estado: 'SC',
  },
  cricParque: {
    localNome: 'Parque Centenário', cep: '88801000', logradouro: 'Avenida Centenário',
    numero: null, complemento: null, bairro: 'Centro', cidade: 'Criciúma', estado: 'SC',
  },
  cricPraca: {
    localNome: 'Praça Nereu Ramos', cep: '88801000', logradouro: 'Rua Coronel Pedro Benedet',
    numero: null, complemento: null, bairro: 'Centro', cidade: 'Criciúma', estado: 'SC',
  },
  cricEspaco: {
    localNome: 'Espaço Pet Amigo', cep: null, logradouro: 'Rua Henrique Lage',
    numero: '315', complemento: 'Sala 2', bairro: 'Centro', cidade: 'Criciúma', estado: 'SC',
  },
  tubUbs: {
    localNome: 'UBS Central', cep: '88701000', logradouro: 'Rua Lauro Müller',
    numero: '120', complemento: null, bairro: 'Centro', cidade: 'Tubarão', estado: 'SC',
  },
  tubPraca: {
    localNome: 'Praça Sete de Setembro', cep: '88701000', logradouro: 'Rua Sete de Setembro',
    numero: null, complemento: null, bairro: 'Centro', cidade: 'Tubarão', estado: 'SC',
  },
  icaGinasio: {
    localNome: 'Ginásio Municipal', cep: '88820000', logradouro: 'Rua Marechal Floriano',
    numero: '500', complemento: null, bairro: 'Centro', cidade: 'Içara', estado: 'SC',
  },
}

// dayOffset: dias a partir de hoje; 'SABADO' = o próximo sábado, calculado
// igual ao filtro "Este fim de semana" (matchesPeriod)
const EVENTS = [
  {
    id: 1, ongId: 1, dayOffset: 'SABADO', categoria: 'FEIRA', place: 'araPraca', capaUrl: COVERS.feira,
    titulo: 'Feira de Adoção de Primavera', horaInicio: '09:00', horaFim: '16:00', vagas: null, confirmados: 18,
    descricao: 'Mais de 40 cães e gatos resgatados, todos vacinados, vermifugados e castrados, esperando uma família. Traga documento com foto e comprovante de residência para agilizar a adoção.',
  },
  {
    id: 2, ongId: 5, dayOffset: 3, categoria: 'SAUDE', place: 'tubUbs', capaUrl: COVERS.castracao,
    titulo: 'Mutirão de Castração Gratuita', horaInicio: '08:00', horaFim: '12:00', vagas: 20, confirmados: 20,
    descricao: 'Castração gratuita de cães e gatos para famílias de baixa renda. O animal precisa estar em jejum de 8 horas. Vagas limitadas à capacidade da equipe veterinária.',
  },
  {
    id: 3, ongId: 4, dayOffset: 5, categoria: 'WORKSHOP', place: 'cricEspaco', capaUrl: COVERS.socorros,
    titulo: 'Workshop: Primeiros Socorros Pet', horaInicio: '14:00', horaFim: '17:00', vagas: 15, confirmados: 13,
    descricao: 'Uma médica-veterinária ensina o que fazer em engasgos, cortes, intoxicações e golpes de calor até chegar à clínica. Aula prática com bonecos de treino.',
  },
  {
    id: 4, ongId: 4, dayOffset: 12, categoria: 'BAZAR', place: 'cricParque', capaUrl: COVERS.bazar,
    titulo: 'Bazar Beneficente Amigo Fiel', horaInicio: '10:00', horaFim: '18:00', vagas: null, confirmados: 6,
    descricao: 'Roupas, acessórios e produtos pet doados pela comunidade. Toda a renda vai para o tratamento dos animais do abrigo.',
  },
  {
    id: 5, ongId: 1, dayOffset: 9, categoria: 'FEIRA', place: 'araSede', capaUrl: COVERS.gatos,
    titulo: 'Feira de Adoção de Gatinhos', horaInicio: '13:00', horaFim: '17:00', vagas: null, confirmados: 4,
    descricao: 'Filhotes e adultos resgatados, testados para FIV/FeLV e prontos para um lar com janelas teladas. Conversamos com cada família antes da adoção.',
  },
  {
    id: 6, ongId: 5, dayOffset: 16, categoria: 'SAUDE', place: 'icaGinasio', capaUrl: COVERS.vacina,
    titulo: 'Mutirão de Vacinação Antirrábica', horaInicio: '08:00', horaFim: '15:00', vagas: 80, confirmados: 9,
    descricao: 'Vacina antirrábica gratuita para cães e gatos a partir de 3 meses. Traga a carteirinha de vacinação, se tiver. Cães na guia e gatos na caixa de transporte.',
  },
  {
    id: 7, ongId: 1, dayOffset: 20, categoria: 'WORKSHOP', place: 'araSede', capaUrl: COVERS.adestramento,
    titulo: 'Workshop: Adestramento Positivo', horaInicio: '15:00', horaFim: '18:00', vagas: 25, confirmados: 3,
    descricao: 'Técnicas de adestramento com reforço positivo para quem acabou de adotar: guia, chamado, xixi no lugar certo e ansiedade de separação.',
  },
  {
    id: 8, ongId: 4, dayOffset: 26, categoria: 'FEIRA', place: 'cricParque', capaUrl: COVERS.feira,
    titulo: 'Feira Pet no Parque', horaInicio: '09:00', horaFim: '13:00', vagas: null, confirmados: 0,
    descricao: 'Manhã de adoção ao ar livre com os cães do Abrigo Amigo Fiel. Venha conhecer, passear com eles e tirar dúvidas com os voluntários.',
  },
  {
    id: 9, ongId: 5, dayOffset: 33, categoria: 'SAUDE', place: 'tubPraca', capaUrl: COVERS.vacina,
    titulo: 'Mutirão de Vermifugação', horaInicio: '09:00', horaFim: null, vagas: 60, confirmados: 2,
    descricao: 'Vermífugo gratuito para cães e gatos, com orientação sobre a frequência certa para cada idade. Atendimento por ordem de chegada enquanto houver doses.',
  },
  {
    id: 10, ongId: 1, dayOffset: 41, categoria: 'BAZAR', place: 'araGinasio', capaUrl: COVERS.bazar,
    titulo: 'Bazar Solidário de Verão', horaInicio: '10:00', horaFim: '16:00', vagas: null, confirmados: 0,
    descricao: 'Moda praia, brinquedos e artigos para casa a preços simbólicos. O dinheiro arrecadado paga as castrações do próximo trimestre.',
  },
  {
    id: 11, ongId: 4, dayOffset: 48, categoria: 'WORKSHOP', place: 'cricEspaco', capaUrl: null,
    titulo: 'Workshop: Nutrição e Bem-Estar', horaInicio: '19:00', horaFim: '21:00', vagas: 30, confirmados: 1,
    descricao: 'Ração, alimentação natural e petiscos: o que muda em cada fase da vida do animal. Com espaço para perguntas ao final.',
  },
  {
    id: 12, ongId: 5, dayOffset: 55, categoria: 'FEIRA', place: 'tubPraca', capaUrl: COVERS.gatos,
    titulo: 'Feira de Adoção de Fim de Ano', horaInicio: '09:00', horaFim: '17:00', vagas: null, confirmados: 0,
    descricao: 'A última feira do ano da ONG Patas Unidas, com cães e gatos de todas as idades. Adoção responsável: nenhum animal sai como presente surpresa.',
  },
  {
    id: 13, ongId: 1, dayOffset: 0, categoria: 'FEIRA', place: 'cricPraca', capaUrl: COVERS.feira,
    titulo: 'Plantão de Adoção na Praça', horaInicio: '14:00', horaFim: '18:00', vagas: null, confirmados: 5,
    descricao: 'Plantão rápido com os animais mais antigos do abrigo, que esperam há mais tempo por uma família.',
  },
  {
    id: 14, ongId: 1, dayOffset: -12, categoria: 'FEIRA', place: 'araPraca', capaUrl: COVERS.feira,
    titulo: 'Feira de Adoção de Inverno', horaInicio: '09:00', horaFim: '15:00', vagas: null, confirmados: 7,
    descricao: 'Feira que já aconteceu — 23 animais foram adotados neste dia.',
  },
  {
    id: 15, ongId: 5, dayOffset: -30, categoria: 'SAUDE', place: 'tubUbs', capaUrl: COVERS.castracao,
    titulo: 'Mutirão de Castração de Agosto', horaInicio: '08:00', horaFim: '12:00', vagas: 20, confirmados: 12,
    descricao: 'Mutirão que já aconteceu, com 12 animais castrados.',
  },
  {
    id: 16, ongId: 4, dayOffset: 8, categoria: 'BAZAR', place: 'cricPraca', capaUrl: COVERS.bazar, status: 'CANCELADO',
    titulo: 'Bazar do Dia dos Animais', horaInicio: '10:00', horaFim: '17:00', vagas: null, confirmados: 3,
    descricao: 'Evento cancelado pela ONG — só aparece em Minha conta, para quem tinha confirmado presença.',
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

const ATTENDEES = ATTENDEE_NAMES.map((nome, index) => ({
  id: 9001 + index,
  nome,
  fotoUrl: ATTENDEE_PHOTOS[index] ?? null,
}))

function ongSnapshot(ongId) {
  const profile = mockPublicProfiles.find((p) => p.id === ongId)
  return { id: profile.id, nome: profile.name, isVerificado: Boolean(profile.isVerified), fotoUrl: profile.photoUrl ?? null }
}

function buildAttendance(evento, count, today) {
  // Confirmações nos dias anteriores ao evento (ou a hoje, se ele ainda vai acontecer)
  const lastDay = evento.data < today ? evento.data : today
  return Array.from({ length: count }, (_, index) => ({
    eventoId: evento.id,
    usuario: ATTENDEES[(evento.id * 5 + index) % ATTENDEES.length],
    dataConfirmacao: `${addDaysIso(lastDay, -1 - (index % 10))}T${String(8 + (index % 12)).padStart(2, '0')}:${index % 2 ? '30' : '05'}:00`,
  }))
}

export function buildSeedEventos() {
  const today = todayLocalIso()
  const saturdayOffset = (6 - new Date().getDay() + 7) % 7

  const eventos = []
  const presencas = []

  EVENTS.forEach(({ ongId, dayOffset, place, confirmados, status, ...fields }) => {
    const evento = {
      ...fields,
      data: addDaysIso(today, dayOffset === 'SABADO' ? saturdayOffset : dayOffset),
      ...PLACES[place],
      status: status ?? 'ATIVO',
      dataCriacao: `${addDaysIso(today, -40)}T09:30:00`,
      ong: ongSnapshot(ongId),
    }
    eventos.push(evento)
    presencas.push(...buildAttendance(evento, confirmados, today))
  })

  return { eventos, presencas, demoAttendanceUserIds: [] }
}
