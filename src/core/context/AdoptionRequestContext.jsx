import { createContext, useContext, useState } from 'react'
import { adoptionRequestsSeed } from '../../features/adocao/data/adoptionRequestsSeed'

const AdoptionRequestContext = createContext(null)

export function AdoptionRequestProvider({ children }) {
  const [requests, setRequests] = useState(adoptionRequestsSeed)

  function acceptRequest(requestId) {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: 'ACCEPTED' } : request))
    )
  }

  function rejectRequest(requestId) {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: 'REJECTED' } : request))
    )
  }

  return (
    <AdoptionRequestContext.Provider value={{ requests, acceptRequest, rejectRequest }}>
      {children}
    </AdoptionRequestContext.Provider>
  )
}

export function useAdoptionRequests() {
  const context = useContext(AdoptionRequestContext)
  if (!context) throw new Error('useAdoptionRequests deve ser usado dentro de um AdoptionRequestProvider')
  return context
}