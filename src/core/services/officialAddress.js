import { fetchAddressByCep } from './viaCepService'
import { fetchCitiesByState } from './ibgeService'
import { normalizeSearch } from '../utils/search'

// A Receita Federal (CNPJ na BrasilAPI) guarda o endereço em CAIXA ALTA e
// SEM ACENTO: "CRICIUMA", "PIO CORREA". Sem corrigir, a mesma cidade aparece
// de dois jeitos no filtro de cidades. Aqui o endereço ganha a grafia
// oficial:
// 1. pelo CEP, na ViaCEP (rua, bairro, cidade e UF dos Correios);
// 2. se a ViaCEP falhar, a cidade é trocada pela da lista do IBGE da UF,
//    comparando sem acento.
// Número e complemento ficam como vieram, porque o CEP não traz esses dados.
// Nunca falha: no pior caso, devolve o endereço como recebeu
export async function withOfficialSpelling(address) {
  try {
    const found = await fetchAddressByCep(address.cep)
    if (found) {
      return {
        ...address,
        street: found.street || address.street,
        district: found.neighborhood || address.district,
        city: found.city || address.city,
        state: found.state || address.state,
      }
    }
  } catch {
    // ViaCEP fora do ar: tenta só a cidade pelo IBGE
  }

  try {
    if (address.state && address.city) {
      const cities = await fetchCitiesByState(address.state)
      const official = cities.find((name) => normalizeSearch(name) === normalizeSearch(address.city))
      if (official) return { ...address, city: official }
    }
  } catch {
    // IBGE fora do ar: fica a grafia da Receita
  }

  return address
}
