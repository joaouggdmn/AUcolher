import { createContext, useContext, useEffect, useState } from 'react'
import { adoptionRequestsSeed } from '../../features/adocao/data/adoptionRequestsSeed'
import { ADOPTION_REQUESTS_STORAGE_KEY } from '../utils/storageKeys'

const AdoptionRequestContext = createContext(null)

function loadInitialRequests() {
  try {
    const stored = localStorage.getItem(ADOPTION_REQUESTS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // localStorage corrompido ou indisponível — cai para o seed
  }
  return adoptionRequestsSeed
}

export function AdoptionRequestProvider({ children }) {
  const [requests, setRequests] = useState(loadInitialRequests)

  // Persiste toda alteração — o localStorage funciona como um "banco de
  // dados" mockado, compartilhado entre abas do mesmo navegador
  useEffect(() => {
    localStorage.setItem(ADOPTION_REQUESTS_STORAGE_KEY, JSON.stringify(requests))
  }, [requests])

  // Sincroniza em tempo real quando OUTRA aba grava uma mudança — sem
  // isso, a aba do doador só veria o pedido novo após um F5 manual
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== ADOPTION_REQUESTS_STORAGE_KEY || !event.newValue) return
      try {
        setRequests(JSON.parse(event.newValue))
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function createRequest({ animalId, ownerId, adopter }) {
    const newRequest = {
      id: Date.now(),
      animalId,
      ownerId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      adopter,
    }
    setRequests((prev) => [newRequest, ...prev])
    return newRequest
  }

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
    <AdoptionRequestContext.Provider value={{ requests, createRequest, acceptRequest, rejectRequest }}>
      {children}
    </AdoptionRequestContext.Provider>
  )
}

export function useAdoptionRequests() {
  const context = useContext(AdoptionRequestContext)
  if (!context) throw new Error('useAdoptionRequests deve ser usado dentro de um AdoptionRequestProvider')
  return context
}