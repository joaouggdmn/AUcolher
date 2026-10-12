import { useMemo, useSyncExternalStore } from 'react'
import {
  getModerationSnapshot,
  isAccountBanned,
  readBannedAccounts,
  subscribeModeration,
} from '../services/moderationMock'

// Decisões de moderação do modo mock para as telas do site, sempre em dia:
// uma conta banida nesta aba ou em outra some na hora, sem recarregar.
// Com a moderação no backend, nada está banido aqui (a API já filtra)
export function useModeration() {
  const snapshot = useSyncExternalStore(subscribeModeration, getModerationSnapshot)

  return useMemo(() => {
    const bannedAccounts = snapshot == null ? [] : readBannedAccounts()
    return { isAccountBanned: (account) => isAccountBanned(account, bannedAccounts) }
  }, [snapshot])
}
