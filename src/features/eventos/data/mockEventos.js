export const baseEventos = [
  {
    id: 1,
    title: 'Feira de Adoção de Verão',
    description: 'O maior mutirão de adoção da região reunindo mais de 40 animais resgatados, prontos para encontrar uma família.',
    category: 'FEIRA',
    date: '2026-08-01',
    time: '09:00 - 16:00',
    location: { venue: 'Parque Centenário', city: 'Criciúma' },
    organizer: { name: 'Patinhas Carentes' },
    coverUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Mutirão de Castração Gratuita',
    description: 'Castração gratuita para cães e gatos de famílias de baixa renda. Vagas limitadas, inscrição prévia obrigatória.',
    category: 'SAUDE',
    date: '2026-07-28',
    time: '08:00 - 12:00',
    location: { venue: 'UBS Central', city: 'Araranguá' },
    organizer: { name: 'ONG Patas Unidas' },
    coverUrl: 'https://images.unsplash.com/photo-1584553421349-3557471bed79?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
  {
    id: 3,
    title: 'Workshop: Primeiros Socorros Pet',
    description: 'Aprenda técnicas essenciais de primeiros socorros para cães e gatos com uma médica veterinária.',
    category: 'WORKSHOP',
    date: '2026-08-02',
    time: '14:00 - 17:00',
    location: { venue: 'Espaço Pet Amigo', city: 'Criciúma' },
    organizer: { name: 'Instituto Vida Animal' },
    coverUrl: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
  {
    id: 4,
    title: 'Bazar Beneficente Amigo Fiel',
    description: 'Roupas, acessórios e produtos pet à venda — toda a renda revertida para tratamento dos animais do abrigo.',
    category: 'BAZAR',
    date: '2026-08-15',
    time: '10:00 - 18:00',
    location: { venue: 'Praça XV', city: 'Tubarão' },
    organizer: { name: 'Abrigo Amigo Fiel' },
    coverUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
  {
    id: 5,
    title: 'Feira de Adoção Independente',
    description: 'Gatinhos resgatados, todos vacinados e vermifugados, buscando um lar através do nosso coletivo de proteção.',
    category: 'FEIRA',
    date: '2026-08-22',
    time: '13:00 - 17:00',
    location: { venue: 'Shopping Del Rey', city: 'Criciúma' },
    organizer: { name: 'Coletivo Gatil Livre' },
    coverUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
  {
    id: 6,
    title: 'Mutirão de Vacinação Antirrábica',
    description: 'Vacinação gratuita contra raiva para cães e gatos. Traga seu pet e a carteira de vacinação, se tiver.',
    category: 'SAUDE',
    date: '2026-09-10',
    time: '08:00 - 15:00',
    location: { venue: 'Ginásio Municipal', city: 'Içara' },
    organizer: { name: 'ONG Patas Unidas' },
    coverUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
  {
    id: 7,
    title: 'Workshop: Adestramento Positivo',
    description: 'Técnicas de adestramento baseadas em reforço positivo, ideais para tutores de primeira viagem.',
    category: 'WORKSHOP',
    date: '2026-08-05',
    time: '15:00 - 18:00',
    location: { venue: 'Sede Patinhas Carentes', city: 'Araranguá' },
    organizer: { name: 'Patinhas Carentes' },
    coverUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
  },
]

const EXTRA_EVENT_TITLES = [
  'Feira de Adoção Comunitária', 'Mutirão de Vermifugação', 'Bazar de Inverno',
  'Workshop: Enriquecimento Ambiental', 'Feira Pet Amigo', 'Mutirão Castra Móvel',
  'Bazar Solidário de Verão', 'Workshop: Nutrição Canina', 'Feira de Adoção no Parque',
]
const EXTRA_CITIES = ['Araranguá', 'Criciúma', 'Tubarão', 'Içara']

function buildExtraEventos() {
  return EXTRA_EVENT_TITLES.map((title, index) => {
    const base = baseEventos[index % baseEventos.length] // reaproveita categoria/foto/organizador

    // Datas espalhadas nos próximos ~60 dias, a partir da data mais recente do mock
    const date = new Date('2026-07-28')
    date.setDate(date.getDate() + (index + 1) * 4)

    return {
      ...base,
      id: 200 + index,
      title,
      date: date.toISOString().slice(0, 10),
      location: { ...base.location, city: EXTRA_CITIES[index % EXTRA_CITIES.length] },
      isFeatured: false, // só o evento original marcado como destaque permanece no Hero
    }
  })
}

export const mockEventos = [...baseEventos, ...buildExtraEventos()]