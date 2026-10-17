import { normalizeSearch } from '../../../core/utils/search'

// Palavras que, sozinhas na busca, querem dizer uma espécie. A busca da API
// olha nome, raça e cidade, e a raça de um cachorro nunca diz "cachorro".
// Coelho, hamster, calopsita... não precisam daqui: a espécie OTHER guarda
// qual é o animal no campo de raça, que a busca já cobre
const SPECIES_WORDS = {
  DOG: ['cachorro', 'cachorros', 'cachorrinho', 'cachorrinhos', 'cao', 'caes', 'cadela', 'cadelas', 'cadelinha', 'canino', 'caninos', 'dog', 'dogs'],
  CAT: ['gato', 'gatos', 'gata', 'gatas', 'gatinho', 'gatinhos', 'gatinha', 'gatinhas', 'felino', 'felinos', 'cat', 'cats'],
}

// "Cachorros", "cão", "GATINHA" → 'DOG' / 'CAT'; qualquer outro termo → null
export function speciesFromSearch(term) {
  const normalized = normalizeSearch(term)
  if (!normalized) return null
  return Object.keys(SPECIES_WORDS).find((species) => SPECIES_WORDS[species].includes(normalized)) ?? null
}
