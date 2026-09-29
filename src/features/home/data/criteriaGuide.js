import { FaHouseChimney, FaBolt, FaClock, FaChildren, FaHeart } from 'react-icons/fa6'
import { buildMatchCriteria } from '../../aumatch/utils/matchScore'

// Os mesmos ícones do MatchReasonsModal (lá eles não são exportados)
export const CRITERION_ICONS = {
  housing: FaHouseChimney,
  energy: FaBolt,
  independence: FaClock,
  living: FaChildren,
  temperament: FaHeart,
}

// Quantos critérios o algoritmo pontua, lido dele mesmo (com perfis vazios
// buildMatchCriteria devolve a lista completa): o texto do hero acompanha
// se um critério entrar ou sair em matchScore.js
export const CRITERIA_COUNT = buildMatchCriteria({}, {}).length
