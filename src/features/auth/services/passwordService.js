import api from '../../../core/services/api'
import { USE_MOCK_SENHA } from '../../../core/utils/constants'
import * as passwordMock from './passwordMock'

// Recuperar senha (docs/entrega-final/api-senha.md §3). Trocar a senha logado
// também passa por aqui: "Alterar senha" de Minha conta pede o mesmo link de
// redefinição para o e-mail da conta. Com USE_MOCK_SENHA, quem responde é o
// passwordMock

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
