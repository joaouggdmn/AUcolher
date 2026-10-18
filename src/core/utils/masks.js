export function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')                          // remove tudo que não é dígito
    .slice(0, 14)                                 // limita a 14 dígitos
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function maskCEP(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2')
}

// Número do endereço: só dígitos. Sem número é "S/N", marcado à parte
export const NO_ADDRESS_NUMBER = 'S/N'

export function maskAddressNumber(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 6)
}

// Número vindo de fora (Receita, pelo CNPJ) no mesmo formato do campo:
// "S/N", "SN" ou vazio viram "S/N"; "1250 SALA 2" fica "1250" (o resto já
// costuma vir no complemento)
export function normalizeAddressNumber(raw) {
  const digits = String(raw ?? '').match(/\d+/)?.[0]
  return digits ? digits.slice(0, 6) : NO_ADDRESS_NUMBER
}
