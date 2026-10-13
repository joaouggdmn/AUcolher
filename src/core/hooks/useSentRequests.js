import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAdoptionRequests } from '../context/AdoptionRequestContext'
import { isSameId } from '../utils/ids'

const ACTIVE_STATUSES = ['PENDING', 'ACCEPTED', 'AWAITING_DELIVERY']

// Os pedidos que a conta logada enviou (lado do adotante), do mais recente
// para o mais antigo, separados como a tela "Meus interesses" mostra
export function useSentRequests() {
  const { user } = useAuth()
  const { requests } = useAdoptionRequests()

  const sentRequests = useMemo(() => {
    if (!user) return []
    return requests
      .filter((request) => isSameId(request.adopter?.userId, user.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [user, requests])

  const activeRequests = sentRequests.filter((request) => ACTIVE_STATUSES.includes(request.status))

  return {
    sentRequests,
    activeRequests,
    concludedRequests: sentRequests.filter((request) => request.status === 'CONCLUDED'),
    closedRequests: sentRequests.filter((request) => request.status === 'REJECTED' || request.status === 'CANCELLED'),
    activeCount: activeRequests.length,
  }
}
