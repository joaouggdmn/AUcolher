import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { EVENTOS_STALE_TIME } from '../../../core/utils/constants'
import {
  cancelAttendance,
  confirmAttendance,
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  listMyAttendance,
  listMyEvents,
  listParticipants,
  updateEvent,
} from '../services/eventoService'

// ---------- leitura ----------

// Vitrine pública (/eventos, home, perfil da ONG com `ongId`)
export function useEvents({ ongId = null, enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.eventos.list({ ongId: ongId == null ? null : String(ongId) }),
    queryFn: () => listEvents({ ongId }),
    staleTime: EVENTOS_STALE_TIME,
    enabled,
  })
}

export function useEvent(id) {
  return useQuery({
    queryKey: queryKeys.eventos.detail(id),
    queryFn: () => getEvent(id),
    staleTime: EVENTOS_STALE_TIME,
    enabled: id != null,
  })
}

// Painel da ONG: todos os eventos dela, inclusive passados
export function useMyEvents() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.eventos.mine(userId),
    queryFn: listMyEvents,
    staleTime: EVENTOS_STALE_TIME,
    enabled: userId != null && user.userType === 'ONG',
  })
}

export function useEventParticipants(eventId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.eventos.participants(eventId),
    queryFn: () => listParticipants(eventId),
    enabled: enabled && eventId != null,
  })
}

// Eventos em que a conta logada confirmou presença — alimenta os botões
// "Confirmar presença" e "Eventos participados" em Minha conta
export function useMyAttendance() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.eventos.myAttendance(userId),
    queryFn: listMyAttendance,
    staleTime: EVENTOS_STALE_TIME,
    enabled: userId != null,
  })
}

// ---------- escrita ----------

// Qualquer escrita pode mudar listas, detalhes e as chaves "me" — invalida o
// módulo inteiro. Devolver a promise mantém a mutation "pendente" até as
// telas terem os dados novos
function useInvalidateEvents() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.eventos.all })
}

export function useCreateEvent() {
  const invalidateEvents = useInvalidateEvents()
  return useMutation({
    mutationFn: (values) => createEvent(values),
    onSuccess: invalidateEvents,
  })
}

export function useUpdateEvent() {
  const invalidateEvents = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ id, values }) => updateEvent(id, values),
    onSuccess: invalidateEvents,
  })
}

export function useDeleteEvent() {
  const invalidateEvents = useInvalidateEvents()
  return useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: invalidateEvents,
  })
}

// { eventId, attending: true | false } — confirma ou cancela a presença
export function useSetAttendance() {
  const queryClient = useQueryClient()
  const invalidateEvents = useInvalidateEvents()

  return useMutation({
    mutationFn: ({ eventId, attending }) => (attending ? confirmAttendance(eventId) : cancelAttendance(eventId)),
    onSuccess: (event) => {
      // O backend devolve o evento com o contador novo: o detalhe já atualiza
      // sem esperar a nova busca
      queryClient.setQueryData(queryKeys.eventos.detail(event.id), event)
      return invalidateEvents()
    },
  })
}
