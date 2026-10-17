import axios from 'axios'
import api from '../../../core/services/api'
import { createMockStore, getMockSession, isSameId, mockDelay, mockHttpError } from '../../../core/services/mock/mockStore'
import { USE_MOCK_EXCLUSAO } from '../../../core/utils/constants'
import { nowLocalIso } from '../../../core/utils/localDate'
import { MOCK_EXCLUSAO_STORE_KEY } from '../../../core/utils/storageKeys'

// 🔴 "Servidor falso" da exclusão de conta (USE_MOCK_EXCLUSAO), até a rota da
// migração 013 existir (docs/entrega-final/api-exclusao-conta.md). Guarda só
// quem excluiu a conta, para o login dela passar a ser recusado. Limitação: a
// cascata não é simulada — anúncios, pedidos, campanhas e eventos da conta
// continuam como estão na API até o backend fazer a exclusão de verdade
const store = createMockStore({
  key: MOCK_EXCLUSAO_STORE_KEY,
  version: 1,
  seed: () => ({ deletedAccounts: [] }),
})

export function isAccountDeleted(account) {
  if (!USE_MOCK_EXCLUSAO || account?.id == null) return false
  return store.read().deletedAccounts.some((deleted) => isSameId(deleted.id, account.id))
}

// A senha é conferida de verdade, por um login na API. Usa o axios puro: o
// 401 de uma senha errada não pode passar pelo interceptor do `api`, que
// derrubaria a sessão
async function checkPassword(email, password) {
  try {
    await axios.post(`${api.defaults.baseURL}/auth/login`, { email, password })
  } catch (error) {
    if (error.response?.status === 401) throw mockHttpError(400, 'Senha incorreta.')
    throw error
  }
}

// POST /api/users/me/deletion — { password } ou { confirmation: "EXCLUIR" }
export async function deleteMyAccount(body) {
  await mockDelay()
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  if (user.userType === 'ADMIN') throw mockHttpError(403, 'A conta de administrador não pode ser excluída.')

  if (user.hasPassword ?? true) {
    if (!body?.password) throw mockHttpError(400, 'Senha incorreta.')
    await checkPassword(user.email, body.password)
  } else if (body?.confirmation !== 'EXCLUIR') {
    throw mockHttpError(400, 'Digite EXCLUIR para confirmar.')
  }

  const db = store.read()
  store.write({
    ...db,
    deletedAccounts: [
      ...db.deletedAccounts.filter((deleted) => !isSameId(deleted.id, user.id)),
      { id: user.id, deletedAt: nowLocalIso() },
    ],
  })
}

// Para o painel do admin no modo mock: quando cada conta foi excluída
export function readDeletedAccounts() {
  return USE_MOCK_EXCLUSAO ? store.read().deletedAccounts : []
}
