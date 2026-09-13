import { stateNameToUf } from '../utils/brazilianStates'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

// ⚠️ Política de uso do Nominatim: no máximo 1 requisição/segundo, e a
// documentação oficial pede identificação da aplicação (User-Agent ou
// Referer). O navegador já envia um Referer automaticamente, o que é
// tolerado para uso de baixo volume como este projeto acadêmico — mas em
// produção real, o ideal é proxiar essas chamadas pelo próprio backend
// Spring Boot, nunca chamar direto do navegador do cliente final.

// GPS → endereço (usado quando o usuário clica em "Usar localização exata")
export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: 'json',
    lat: latitude,
    lon: longitude,
    addressdetails: '1',
  })

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`)
  if (!response.ok) throw new Error('nominatim-reverse-failed')

  const data = await response.json()
  const address = data.address ?? {}

  return {
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? '',
    state: stateNameToUf(address.state),
  }
}

// Endereço (vindo do ViaCEP) → coordenadas aproximadas
export async function forwardGeocode({ street, neighborhood, city, state }) {
  const query = [street, neighborhood, city, state, 'Brasil'].filter(Boolean).join(', ')

  const params = new URLSearchParams({
    format: 'json',
    q: query,
    addressdetails: '1',
    limit: '1',
    countrycodes: 'br',
  })

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`)
  if (!response.ok) throw new Error('nominatim-search-failed')

  const results = await response.json()
  if (!results.length) return null

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
  }
}