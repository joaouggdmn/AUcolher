import api from '../../../core/services/api'
import { toFrontendProfile } from '../../../core/services/authService'
import { USE_MOCK_SENHA } from '../../../core/utils/constants'
import * as passwordMock from './passwordMock'

// Trocar e recuperar senha (docs/entrega-final/api-senha.md §3). Com
// USE_MOCK_SENHA, quem responde é o passwordMock

// PUT /users/me/password → AuthResponseDTO: o token NOVO (os anteriores, de
// todas as sessões, deixam de valer) e o usuário. `currentPassword` é
// ignorado em conta sem senha (Google)
export async function changePassword({ currentPassword, newPassword }) {
  const payload = { currentPassword: currentPassword || null, newPassword }
  const data = USE_MOCK_SENHA
    ? await passwordMock.changePassword(payload)
    : (await api.put('/users/me/password', payload)).data

  return {
    token: data.token,
    tokenType: data.type ?? 'Bearer',
    user: data.user ? toFrontendProfile(data.user) : null,
  }
}

// A resposta é sempre a mesma, exista conta ou não. No mock, volta também o
// link que iria por e-mail ({ testLink, throttled }); com a API, null
export async function requestPasswordReset(email) {
  if (USE_MOCK_SENHA) return passwordMock.requestPasswordReset(email)
  await api.post('/auth/password/forgot', { email })
  return null
}

// POST de propósito: o token não aparece em URL de API nem em log de acesso
export async function checkResetToken(token) {
  if (USE_MOCK_SENHA) return passwordMock.checkResetToken(token)
  await api.post('/auth/password/reset/check', { token })
}

export async function resetPassword({ token, newPassword }) {
  if (USE_MOCK_SENHA) return passwordMock.resetPassword({ token, newPassword })
  await api.post('/auth/password/reset', { token, newPassword })
}
