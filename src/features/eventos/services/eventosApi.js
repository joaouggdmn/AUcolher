import api from '../../../core/services/api'

// Adaptador real: é o contrato de docs/api-campanhas-eventos.md §3 em código.
// eventosMock.js tem as mesmas funções e devolve os mesmos DTOs

export async function listEvents({ ngoId } = {}) {
  const { data } = await api.get('/events', { params: { ngoId: ngoId ?? undefined } })
  return data
}

export async function getEvent(id) {
  const { data } = await api.get(`/events/${id}`)
  return data
}

export async function createEvent(payload) {
  const { data } = await api.post('/events', payload)
  return data
}

export async function updateEvent(id, payload) {
  const { data } = await api.put(`/events/${id}`, payload)
  return data
}

export async function deleteEvent(id) {
  await api.delete(`/events/${id}`)
}

// Eventos da ONG logada, inclusive os que já passaram
export async function listMyEvents() {
  const { data } = await api.get('/events/mine')
  return data
}

// Presença: POST e DELETE são idempotentes e devolvem o evento atualizado
export async function confirmAttendance(id) {
  const { data } = await api.post(`/events/${id}/attendance`)
  return data
}

export async function cancelAttendance(id) {
  const { data } = await api.delete(`/events/${id}/attendance`)
  return data
}

// Lista de confirmados — só a ONG dona
export async function listParticipants(id) {
  const { data } = await api.get(`/events/${id}/attendees`)
  return data
}

// Eventos em que o usuário logado confirmou presença (passados e cancelados inclusos)
export async function listMyAttendance() {
  const { data } = await api.get('/events/attending')
  return data
}
