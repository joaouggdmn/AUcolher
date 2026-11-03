import api from '../../../core/services/api'

// Recuperar senha (docs/entrega-final/api-senha.md §3). Trocar a senha logado
// também passa por aqui: "Alterar senha" de Minha conta pede o mesmo link de
// redefinição para o e-mail da conta

// A resposta é sempre a mesma, exista conta ou não
export async function requestPasswordReset(email) {
  await api.post('/auth/password/forgot', { email })
}

// POST de propósito: o token não aparece em URL de API nem em log de acesso
export async function checkResetToken(token) {
  await api.post('/auth/password/reset/check', { token })
}

export async function resetPassword({ token, newPassword }) {
  await api.post('/auth/password/reset', { token, newPassword })
}
