// Endereço de um CEP pela ViaCEP, com a grafia oficial dos Correios
// ("Criciúma", "Pio Corrêa"). null quando o CEP não existe; erro de rede sobe
export async function fetchAddressByCep(cep) {
  const digits = String(cep ?? '').replace(/\D/g, '')
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!response.ok) throw new Error('network-error')

  const data = await response.json()
  if (data.erro) return null

  return {
    city: data.localidade,
    state: data.uf,
    street: data.logradouro,
    neighborhood: data.bairro,
  }
}
