import {
  FaBuilding, FaHouseChimney, FaTractor,
  FaCouch, FaPersonWalking, FaPersonRunning,
  FaHouseUser, FaBriefcase, FaBusinessTime,
  FaChildren, FaXmark,
  FaDog, FaCat, FaPaw,
  FaMoon, FaBone, FaShieldHalved,
  FaFeatherPointed,
} from 'react-icons/fa6'

export const quizQuestions = [
  // ───────────── Seção 1: Seu Estilo de Vida & Ambiente ─────────────
  {
    key: 'moradia',
    section: 'estiloDeVida',
    title: 'Onde você mora?',
    subtitle: 'Isso nos ajuda a indicar pets que se adaptam bem ao seu espaço.',
    options: [
      { value: 'APARTAMENTO', label: 'Apartamento', icon: FaBuilding },
      { value: 'CASA_QUINTAL', label: 'Casa com quintal', icon: FaHouseChimney },
      { value: 'SITIO', label: 'Sítio / Chácara', icon: FaTractor },
    ],
  },
  {
    key: 'rotinaExercicio',
    section: 'estiloDeVida',
    title: 'Como é a sua rotina de exercícios?',
    subtitle: 'Pets também têm níveis de energia diferentes — vamos parear com o seu.',
    options: [
      { value: 'SEDENTARIO', label: 'Sedentário', icon: FaCouch },
      { value: 'ATIVO', label: 'Ativo', icon: FaPersonWalking },
      { value: 'MUITO_ATIVO', label: 'Muito ativo', icon: FaPersonRunning },
    ],
  },
  {
    key: 'tempoForaCasa',
    section: 'estiloDeVida',
    title: 'Quanto tempo você passa fora de casa no seu dia a dia?',
    subtitle: 'Isso nos ajuda a sugerir pets com o nível de independência adequado.',
    options: [
      { value: 'POUCO_TEMPO', label: 'Pouco tempo', description: 'Até 4h / Home office', icon: FaHouseUser },
      { value: 'PERIODO_NORMAL', label: 'Período normal', description: '4h a 8h / Trabalho presencial', icon: FaBriefcase },
      { value: 'LONGO_PERIODO', label: 'Longo período', description: 'Mais de 8h / Rotina intensa', icon: FaBusinessTime },
    ],
  },
  {
    key: 'temCriancasOuPets',
    section: 'estiloDeVida',
    title: 'Tem crianças ou outros pets em casa?',
    subtitle: 'Vamos priorizar animais com o temperamento certo para conviver bem.',
    options: [
      { value: true, label: 'Sim', icon: FaChildren },
      { value: false, label: 'Não', icon: FaXmark },
    ],
  },

  // ───────────── Seção 2: Suas Preferências para o Pet Ideal ─────────────
  {
    key: 'speciesPreference',
    section: 'preferenciasPet',
    title: 'Qual espécie você procura?',
    subtitle: 'Isso filtra diretamente quais pets aparecem no seu AUmatch.',
    options: [
      { value: 'DOG', label: 'Cachorro', icon: FaDog },
      { value: 'CAT', label: 'Gato', icon: FaCat },
      { value: 'BOTH', label: 'Ambos', icon: FaPaw },
    ],
  },
  {
    key: 'idealPetProfile',
    section: 'preferenciasPet',
    title: 'Qual o seu perfil de pet ideal?',
    subtitle: 'Usamos isso para priorizar pets com o temperamento mais compatível.',
    options: [
      { value: 'CALM_COMPANION', label: 'Companheiro e calmo', icon: FaMoon },
      { value: 'PLAYFUL_ACTIVE', label: 'Brincalhão e ativo', icon: FaBone },
      { value: 'PROTECTIVE_INDEPENDENT', label: 'Protetor e independente', icon: FaShieldHalved },
    ],
  },
  {
    key: 'portePreferido',
    section: 'preferenciasPet',
    title: 'Qual porte você prefere?',
    subtitle: 'Considere o espaço disponível e a facilidade de manejo no dia a dia.',
    options: [
      { value: 'PEQUENO', label: 'Pequeno', icon: FaFeatherPointed },
      { value: 'MEDIO', label: 'Médio', icon: FaPaw },
      { value: 'GRANDE', label: 'Grande', icon: FaDog },
    ],
  },
  // 🆕 Pergunta de "Pelagem" removida — nenhum animal do modelo de dados
  // possui esse atributo hoje, então o filtro não teria efeito prático
  // nenhum sobre os resultados do AUmatch.
]