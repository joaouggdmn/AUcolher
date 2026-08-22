export const baseCampanhas = [
  {
    id: 1,
    title: 'Cirurgia urgente do Rex',
    description: 'Rex foi atropelado e precisa de uma cirurgia ortopédica com urgência. Sem o procedimento, ele pode perder o movimento da pata traseira.',
    category: 'SAUDE',
    isUrgent: true,
    isEmergency: true, // usado para escolher o destaque do Hero SOS
    raisedAmount: 3200,
    goalAmount: 8000,
    coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    ong: { name: 'Patinhas Carentes' },
  },
  {
    id: 2,
    title: 'Ração para 60 animais resgatados',
    description: 'Nosso estoque de ração está acabando e precisamos alimentar 60 cães e gatos resgatados neste mês.',
    category: 'ALIMENTACAO',
    isUrgent: false,
    isEmergency: false,
    raisedAmount: 1800,
    goalAmount: 2000, // 90% — testa o filtro "Quase batendo a meta"
    coverUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    ong: { name: 'ONG Patas Unidas' },
  },
  {
    id: 3,
    title: 'Reforma do canil da nossa sede',
    description: 'O canil precisa de reforma estrutural para melhorar a ventilação e o conforto dos animais durante o verão.',
    category: 'ESTRUTURA',
    isUrgent: false,
    isEmergency: false,
    raisedAmount: 12000,
    goalAmount: 15000, // exatamente 80% — testa o limite do filtro
    coverUrl: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=80',
    ong: { name: 'Abrigo Amigo Fiel' },
  },
  {
    id: 4,
    title: 'Tratamento de sarna da Mel',
    description: 'A gatinha Mel foi resgatada com sarna severa e precisa de medicação contínua por 60 dias.',
    category: 'SAUDE',
    isUrgent: true,
    isEmergency: false,
    raisedAmount: 450,
    goalAmount: 1200,
    coverUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    ong: { name: 'Coletivo Gatil Livre' },
  },
  {
    id: 5,
    title: 'Cobertores para o inverno',
    description: 'Com a queda de temperatura, precisamos de cobertores e mantas para manter os animais aquecidos no abrigo.',
    category: 'ESTRUTURA',
    isUrgent: false,
    isEmergency: false,
    raisedAmount: 900,
    goalAmount: 3000,
    coverUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902861a?auto=format&fit=crop&w=1200&q=80',
    ong: { name: 'Instituto Vida Animal' },
  },
]

const EXTRA_CAMPAIGN_TITLES = [
  'Tratamento oncológico do Fred', 'Fraldas geriátricas para idosos',
  'Reforma do telhado do canil', 'Ração especial para filhotes',
  'Cirurgia de catarata da Mimi', 'Cobertores de inverno para o gatil',
  'Vacinas para os resgatados de outubro', 'Ampliação do espaço de recuperação',
  'Fisioterapia para o Duke', 'Kit de higiene para 40 animais',
]

function buildExtraCampanhas() {
  return EXTRA_CAMPAIGN_TITLES.map((title, index) => {
    const base = baseCampanhas[index % baseCampanhas.length] // reaproveita categoria/foto/ONG

    // Progresso variado: alguns bem no início, outros quase batendo a meta
    const goalAmount = 1500 + index * 350
    const raisedAmount = Math.round(goalAmount * (0.15 + ((index * 13) % 80) / 100))

    return {
      ...base,
      id: 300 + index,
      title,
      goalAmount,
      raisedAmount,
      isUrgent: index % 4 === 0,
      isEmergency: false, // só a campanha original permanece como destaque do Hero SOS
    }
  })
}

export const mockCampanhas = [...baseCampanhas, ...buildExtraCampanhas()]