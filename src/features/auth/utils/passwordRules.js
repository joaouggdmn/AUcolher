// Regras e textos da senha (docs/entrega-final/api-senha.md §1 e §3): os
// formulários validam antes de enviar, e o mock recusa com as mesmas mensagens
export const PASSWORD_MIN_LENGTH = 6

export const PASSWORD_TOO_SHORT_MESSAGE = `A nova senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`
export const PASSWORD_MISMATCH_MESSAGE = 'A confirmação não confere com a nova senha.'
export const INVALID_EMAIL_MESSAGE = 'Informe um e-mail válido.'
export const INVALID_RESET_LINK_MESSAGE = 'Este link é inválido ou expirou. Peça um novo.'

export const FORGOT_PASSWORD_NEUTRAL_MESSAGE =
  'Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.'

// Erros por campo da redefinição ({ newPassword?, confirmPassword? })
export function validateNewPassword({ newPassword, confirmPassword }) {
  const errors = {}
  if (newPassword.length < PASSWORD_MIN_LENGTH) errors.newPassword = PASSWORD_TOO_SHORT_MESSAGE
  if (confirmPassword !== newPassword) errors.confirmPassword = PASSWORD_MISMATCH_MESSAGE
  return errors
}
