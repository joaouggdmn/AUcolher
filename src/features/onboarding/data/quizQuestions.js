import { FaBuilding, FaHouseChimney, FaTractor, FaCouch, FaPersonWalking, FaPersonRunning, FaHouseUser, FaClock, FaBriefcase, FaChildren, FaXmark, FaDog, FaCat, FaPaw, FaMoon, FaBone, FaShieldHalved } from 'react-icons/fa6'

export const quizQuestions = [
  {
    key: 'moradia',
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
    title: 'Como é a sua rotina de exercícios?',
    subtitle: 'Pets também têm níveis de energia diferentes — vamos parear com o seu.',
    options: [
      { value: 'SEDENTARIO', label: 'Sedentário', icon: FaCouch },
      { value: 'ATIVO', label: 'Ativo', icon: FaPersonWalking },
      { value: 'MUITO_ATIVO', label: 'Muito ativo', icon: FaPersonRunning },
    ],
  },
  {
    key: 'tempoSozinho',
    title: 'Quanto tempo o pet ficará sozinho?',
    subtitle: 'Alguns animais lidam melhor com longos períodos sozinhos que outros.',
    options: [
      { value: 'QUASE_NUNCA', label: 'Quase nunca', icon: FaHouseUser },
      { value: 'MEIO_PERIODO', label: 'Meio período', icon: FaClock },
      { value: 'DIA_TODO', label: 'O dia todo', icon: FaBriefcase },
    ],
  },
  {
    key: 'temCriancasOuPets',
    title: 'Tem crianças ou outros pets em casa?',
    subtitle: 'Vamos priorizar animais com o temperamento certo para conviver bem.',
    options: [
      { value: true, label: 'Sim', icon: FaChildren },
      { value: false, label: 'Não', icon: FaXmark },
    ],
  },
  // 🆕 Pergunta 5
  {
    key: 'speciesPreference',
    title: 'Qual espécie você procura?',
    subtitle: 'Isso filtra diretamente quais pets aparecem no seu AUmatch.',
    options: [
      { value: 'DOG', label: 'Cachorro', icon: FaDog },
      { value: 'CAT', label: 'Gato', icon: FaCat },
      { value: 'BOTH', label: 'Ambos', icon: FaPaw },
    ],
  },

  // 🆕 Pergunta 6 — ícones espelham os mesmos usados no temperamento
  // do animal (FaMoon/FaBone/FaShieldHalved), reforçando a conexão
  // visual entre "o que você procura" e "o que o pet é"
  {
    key: 'idealPetProfile',
    title: 'Qual o seu perfil de pet ideal?',
    subtitle: 'Usamos isso para priorizar pets com o temperamento mais compatível.',
    options: [
      { value: 'CALM_COMPANION', label: 'Companheiro e calmo', icon: FaMoon },
      { value: 'PLAYFUL_ACTIVE', label: 'Brincalhão e ativo', icon: FaBone },
      { value: 'PROTECTIVE_INDEPENDENT', label: 'Protetor e independente', icon: FaShieldHalved },
    ],
  }
]