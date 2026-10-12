import { buildMatchCriteria } from '../../aumatch/utils/matchScore'

// Quantos critérios o algoritmo pontua, lido dele mesmo (com perfis vazios
// buildMatchCriteria devolve a lista completa): o texto do hero acompanha
// se um critério entrar ou sair em matchScore.js
export const CRITERIA_COUNT = buildMatchCriteria({}, {}).length
