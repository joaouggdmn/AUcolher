// 🔴 Estas funções vão trocar para chamadas reais (api.post('/aumatch/like'), etc.)
// assim que o endpoint correspondente do Spring Boot estiver disponível.

export async function registerPass(petId) {
  console.log('[AUmatch] Pass registrado para o pet', petId)
  return new Promise((resolve) => setTimeout(resolve, 300))
}

export async function registerLike(petId) {
  console.log('[AUmatch] Like registrado para o pet', petId)
  return new Promise((resolve) => setTimeout(resolve, 300))
}