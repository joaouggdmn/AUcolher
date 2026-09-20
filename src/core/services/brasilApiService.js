import { BRAZILIAN_STATES } from '../utils/brazilianStates'

const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api'

// A Receita devolve tudo em CAIXA ALTA — convertido para um texto legível,
// mantendo conectivos minúsculos e siglas comuns em maiúsculas
const LOWERCASE_WORDS = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])
const UPPERCASE_WORDS = new Set(['ONG', 'SOS', 'LTDA', 'ME', 'EPP', 'EIRELI', 'S/A', 'SA'])

function toTitleCase(text) {
  if (!text) return ''

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (UPPERCASE_WORDS.has(word.replace(/[^\p{L}/]/gu, '').toUpperCase())) return word.toUpperCase()
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word
      return word.replace(/\p{L}/u, (letter) => letter.toUpperCase())
    })
    .join(' ')
}

// O tipo ("RUA", "AVENIDA") vem num campo separado do logradouro
function buildStreet(data) {
  const type = data.descricao_tipo_de_logradouro?.trim() ?? ''
  const street = data.logradouro?.trim() ?? ''
  if (!type || street.toUpperCase().startsWith(`${type.toUpperCase()} `)) return street
  return `${type} ${street}`
}

function toKnownUf(uf) {
  return BRAZILIAN_STATES.some((state) => state.value === uf) ? uf : ''
}

// cnpj: apenas os 14 dígitos
export async function fetchCompanyByCnpj(cnpj) {
  const response = await fetch(`${BRASIL_API_BASE_URL}/cnpj/v1/${cnpj}`)
  if (response.status === 404) throw new Error('cnpj-not-found')
  if (!response.ok) throw new Error('cnpj-lookup-failed')

  const data = await response.json()
  const situation = data.descricao_situacao_cadastral?.trim() ?? ''

  return {
    legalName: toTitleCase(data.razao_social),
    situation,
    // Sem a informação, não alarmamos o usuário à toa
    isActive: !situation || situation.toUpperCase() === 'ATIVA',
    address: {
      cep: String(data.cep ?? ''),
      street: toTitleCase(buildStreet(data)),
      number: data.numero?.trim() ?? '',
      complement: toTitleCase(data.complemento),
      district: toTitleCase(data.bairro),
      city: toTitleCase(data.municipio),
      state: toKnownUf(data.uf),
    },
  }
}
