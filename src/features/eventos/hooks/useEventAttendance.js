import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useMyAttendance, useSetAttendance } from './useEventos'

// Presença da conta logada nos eventos. Uma única query
// (GET /usuarios/me/presencas) alimenta todos os botões da tela e
// "Eventos participados"; cada botão tem a própria mutation, então só o
// evento clicado mostra "salvando"
export function useEventAttendance() {
  const { user } = useAuth()
  const { data: attendedEvents, isLoading } = useMyAttendance()
  const mutation = useSetAttendance()

  const attendedIds = useMemo(() => (attendedEvents ?? []).map((event) => String(event.id)), [attendedEvents])

  function isAttending(eventId) {
    return attendedIds.includes(String(eventId))
  }

  // Retorna false sem sessão — quem chamou abre o convite de login.
  // `options` repassa onSuccess/onError desta chamada (ex.: toast de erro)
  function toggleAttendance(eventId, options) {
    if (user == null) return false
    mutation.mutate({ eventId, attending: !isAttending(eventId) }, options)
    return true
  }

  return {
    attendedIds,
    isAttending,
    toggleAttendance,
    // Logado e a lista ainda não chegou: ainda não dá para saber se confirmou
    isLoading,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
