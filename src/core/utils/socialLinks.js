// Se o usuário colar o link do perfil em vez do @, extrai só o usuário
function extractHandle(value, hostPattern) {
  const trimmed = value.trim()
  const fromUrl = trimmed.match(new RegExp(`(?:^|[/.])${hostPattern}/@?([^/?#\\s]+)`, 'i'))
  return (fromUrl ? fromUrl[1] : trimmed).replace(/^@+/, '')
}

// Regras de usuário de cada rede: Instagram aceita letras, números, ponto e
// underline (até 30); X aceita letras, números e underline (até 15)
export function sanitizeInstagramHandle(value) {
  return extractHandle(value, 'instagram\\.com').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 30)
}

export function sanitizeXHandle(value) {
  return extractHandle(value, '(?:twitter|x)\\.com').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15)
}

// Usado no atributo `pattern` do input — só é checado quando o campo tem valor
export const FACEBOOK_URL_PATTERN = String.raw`(https?://)?([\w\-]+\.)*(facebook|fb)\.com/.+`

export function normalizeFacebookUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function instagramUrl(handle) {
  return handle ? `https://instagram.com/${handle}` : null
}

export function xUrl(handle) {
  return handle ? `https://x.com/${handle}` : null
}
