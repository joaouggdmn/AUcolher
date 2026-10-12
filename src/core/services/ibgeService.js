const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades'

// Municípios de uma UF, em ordem alfabética e já com a grafia oficial
// ("Criciúma"): é isso que mantém a mesma cidade escrita sempre igual nos
// perfis e nos anúncios, sem depender de ninguém digitar. API pública do
// IBGE, sem chave e liberada para chamadas do navegador
export async function fetchCitiesByState(uf) {
  const response = await fetch(`${IBGE_BASE_URL}/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`)
  if (!response.ok) throw new Error('ibge-cities-failed')

  const cities = await response.json()
  return cities.map((city) => city.nome)
}
