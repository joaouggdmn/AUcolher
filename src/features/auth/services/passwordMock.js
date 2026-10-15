import { createMockStore, mockDelay, mockHttpError, nextId } from '../../../core/services/mock/mockStore'
import { MOCK_SENHA_STORE_KEY } from '../../../core/utils/storageKeys'
import {
  INVALID_EMAIL_MESSAGE,
  INVALID_RESET_LINK_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_TOO_SHORT_MESSAGE,
} from '../utils/passwordRules'

// 🔴 "Servidor falso" da senha (USE_MOCK_SENHA), até as rotas da migração 010
// existirem (docs/entrega-final/api-senha.md). Os links de "Esqueci minha
// senha" (também pedidos pelo botão "Alterar senha" de Minha conta) ficam
// aqui, com as regras do contrato (só o hash, 30 min, uso único, um por
// minuto). O link que iria por e-mail volta para a tela mostrar. A nova senha
// NÃO é gravada, e o mock não sabe quais e-mails têm conta
const store = createMockStore({
  key: MOCK_SENHA_STORE_KEY,
  version: 1,
  seed: () => ({ resetTokens: [] }),
})

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000
const RESET_RATE_LIMIT_MS = 60 * 1000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  // Base64 URL-safe sem padding: 43 caracteres, como o SecureRandom da API
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isUsable(row, now = Date.now()) {
  return !row.usedAt && new Date(row.expiresAt).getTime() > now
}

async function findUsableToken(data, token) {
  if (!token) return null
  const tokenHash = await sha256Hex(token)
  return data.resetTokens.find((row) => row.tokenHash === tokenHash && isUsable(row)) ?? null
}

// Devolve o que a API mandaria por e-mail: `testLink` (null dentro do
// limite de um por minuto, com `throttled`)
export async function requestPasswordReset(email) {
  await mockDelay()
  const normalizedEmail = email?.trim().toLowerCase() ?? ''
  if (!EMAIL_PATTERN.test(normalizedEmail)) throw mockHttpError(400, INVALID_EMAIL_MESSAGE)

  const data = store.read()
  const now = Date.now()
  const accountTokens = data.resetTokens.filter((row) => row.email === normalizedEmail)
  const lastCreatedAt = Math.max(0, ...accountTokens.map((row) => new Date(row.createdAt).getTime()))
  if (now - lastCreatedAt < RESET_RATE_LIMIT_MS) return { testLink: null, throttled: true }

  // Um link novo invalida o anterior ainda não usado
  const nowIso = new Date(now).toISOString()
  accountTokens.forEach((row) => {
    if (!row.usedAt) row.usedAt = nowIso
  })

  const token = randomToken()
  data.resetTokens.push({
    id: nextId(data.resetTokens),
    email: normalizedEmail,
    tokenHash: await sha256Hex(token),
    createdAt: nowIso,
    expiresAt: new Date(now + RESET_TOKEN_TTL_MS).toISOString(),
    usedAt: null,
  })
  store.write(data)

  return { testLink: `${window.location.origin}/redefinir-senha?token=${encodeURIComponent(token)}`, throttled: false }
}

export async function checkResetToken(token) {
  await mockDelay()
  if (!(await findUsableToken(store.read(), token))) throw mockHttpError(400, INVALID_RESET_LINK_MESSAGE)
}

export async function resetPassword({ token, newPassword }) {
  await mockDelay()
  const data = store.read()
  const row = await findUsableToken(data, token)
  if (!row) throw mockHttpError(400, INVALID_RESET_LINK_MESSAGE)
  if ((newPassword ?? '').length < PASSWORD_MIN_LENGTH) throw mockHttpError(400, PASSWORD_TOO_SHORT_MESSAGE)

  row.usedAt = new Date().toISOString()
  store.write(data)
}
