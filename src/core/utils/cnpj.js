export function sanitizeCNPJ(value) {
  return value.replace(/\D/g, '').slice(0, 14)
}

// Mesmo algoritmo de dígitos verificadores do CnpjValidator do backend —
// barra aqui o que o Spring Boot recusaria, antes de consultar a BrasilAPI
export function isValidCNPJ(value) {
  const digits = sanitizeCNPJ(value)
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false

  const checkDigit = (position) => {
    const weights = position === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, weight, i) => acc + Number(digits[i]) * weight, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  return checkDigit(12) === Number(digits[12]) && checkDigit(13) === Number(digits[13])
}
