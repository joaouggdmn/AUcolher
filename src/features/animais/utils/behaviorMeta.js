import { FaMoon, FaBone, FaHeart, FaShieldHalved, FaCompass, FaBolt, FaCommentDots, FaBuilding, FaChildren, FaDog, FaCat } from 'react-icons/fa6'

// Compartilhado entre BehaviorProfile (detalhes), os filtros avançados da
// listagem e o formulário de cadastro — única fonte de rótulos/ícones.

export const LEVEL_LABELS = { LOW: 'Baixo', MODERATE: 'Moderado', HIGH: 'Alto' }
export const LEVEL_STEPS = { LOW: 1, MODERATE: 2, HIGH: 3 }

export const TEMPERAMENT_META = {
  CALM: { label: 'Calmo', icon: FaMoon },
  PLAYFUL: { label: 'Brincalhão', icon: FaBone },
  AFFECTIONATE: { label: 'Afetuoso', icon: FaHeart },
  PROTECTIVE: { label: 'Protetor', icon: FaShieldHalved },
  INDEPENDENT: { label: 'Independente', icon: FaCompass },
}

export const LEVEL_FIELD_META = {
  energyLevel: { label: 'Nível de energia', icon: FaBolt },
  independenceLevel: { label: 'Independência', icon: FaCompass },
  vocalization: { label: 'Vocalização', icon: FaCommentDots },
}

export const COMPATIBILITY_META = {
  apartmentFriendly: { label: 'Vive bem em apartamento', icon: FaBuilding },
  goodWithChildren: { label: 'Bom com crianças', icon: FaChildren },
  goodWithDogs: { label: 'Bom com outros cães', icon: FaDog },
  goodWithCats: { label: 'Bom com gatos', icon: FaCat },
}