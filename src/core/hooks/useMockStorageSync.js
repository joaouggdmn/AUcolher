import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  ADOPTION_REQUESTS_STORAGE_KEY,
  MOCK_ADMIN_STORE_KEY,
  MOCK_CAMPANHAS_STORE_KEY,
  MOCK_CHAT_STORE_KEY,
  MOCK_DENUNCIAS_STORE_KEY,
  MOCK_MODERACAO_STORE_KEY,
} from '../utils/storageKeys'

// Chave do banco falso → queries que dependem dele. O painel do admin lê
// todos os outros, então qualquer gravação também o atualiza
const MOCK_STORE_QUERIES = {
  [MOCK_CAMPANHAS_STORE_KEY]: [queryKeys.campanhas.all, queryKeys.doacoes.all, queryKeys.admin.all],
  [MOCK_ADMIN_STORE_KEY]: [queryKeys.admin.all],
  [MOCK_CHAT_STORE_KEY]: [queryKeys.chat.all],
  [MOCK_DENUNCIAS_STORE_KEY]: [queryKeys.denuncias.all, queryKeys.admin.all],
  // Banir ou reativar muda o que o site mostra: vitrine, perfis, favoritos,
  // campanhas e eventos
  [MOCK_MODERACAO_STORE_KEY]: [
    queryKeys.admin.all,
    queryKeys.moderated.animals,
    queryKeys.moderated.favorites,
    queryKeys.moderated.publicProfile,
    queryKeys.campanhas.all,
    queryKeys.eventos.all,
  ],
  [ADOPTION_REQUESTS_STORAGE_KEY]: [queryKeys.admin.all],
}

// Só importa no modo mock: quando outra aba grava no banco falso, o evento
// 'storage' avisa esta aba, que refaz as buscas afetadas — como se o
// servidor tivesse mudado. (Na aba que gravou, as mutations já invalidam)
export function useMockStorageSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleStorage(event) {
      // key null = localStorage.clear() em outra aba: tudo mudou
      const queryKeysToRefresh =
        event.key === null ? Object.values(MOCK_STORE_QUERIES).flat() : (MOCK_STORE_QUERIES[event.key] ?? [])

      queryKeysToRefresh.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [queryClient])
}
