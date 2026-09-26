import { useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { eventAttendanceStorageKey } from '../../../core/utils/storageKeys'

// 🔴 mock: presença em dois eventos do seed que já aconteceram, para
// "Eventos participados" não nascer vazio nos testes. Com a API real a
// lista vem de GET /usuarios/{id}/eventos e este hook vira uma query
const ATTENDANCE_SEED = ['1', '2']

// O evento 'storage' do navegador só dispara nas OUTRAS abas — este Set
// avisa as instâncias do hook na aba atual (card do evento e Minha conta)
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function readStoredAttendance(userId) {
  if (userId == null) return null
  try {
    return localStorage.getItem(eventAttendanceStorageKey(userId))
  } catch {
    return null
  }
}

// IDs sempre como string, igual aos favoritos: o mock usa números e
// params de rota chegam como texto
function parseAttendance(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // payload corrompido — cai para o seed
  }
  return ATTENDANCE_SEED
}

export function useEventAttendance() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  // O snapshot é a string crua do localStorage: strings iguais passam no
  // Object.is do React, então nada re-renderiza se a lista não mudou
  const raw = useSyncExternalStore(subscribe, () => readStoredAttendance(userId))
  const attendedIds = useMemo(() => (userId == null ? [] : parseAttendance(raw)), [raw, userId])

  function isAttending(eventId) {
    return attendedIds.includes(String(eventId))
  }

  // Retorna false sem sessão — quem chamou abre o convite de login
  function toggleAttendance(eventId) {
    if (userId == null) return false

    const id = String(eventId)
    const next = attendedIds.includes(id) ? attendedIds.filter((attended) => attended !== id) : [...attendedIds, id]

    try {
      localStorage.setItem(eventAttendanceStorageKey(userId), JSON.stringify(next))
    } catch (error) {
      console.warn('Não foi possível salvar a presença no evento', error)
    }
    listeners.forEach((listener) => listener())
    return true
  }

  return { attendedIds, isAttending, toggleAttendance }
}
