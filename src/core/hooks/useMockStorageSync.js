import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import { MOCK_EVENTOS_STORE_KEY } from '../utils/storageKeys'

// Chave do banco falso → queries que dependem dele
const MOCK_STORE_QUERIES = {
  [MOCK_EVENTOS_STORE_KEY]: queryKeys.eventos.all,
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
        event.key === null ? Object.values(MOCK_STORE_QUERIES) : [MOCK_STORE_QUERIES[event.key]].filter(Boolean)

      queryKeysToRefresh.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [queryClient])
}
