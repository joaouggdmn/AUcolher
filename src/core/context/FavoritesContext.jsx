import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { favoritesStorageKey } from '../utils/storageKeys'

const FavoritesContext = createContext(null)

// 🔴 mock: alguns IDs do seed já favoritados para a lista não nascer vazia
// nos testes de UX. Quando o backend expor os favoritos, a carga inicial vem
// da API e estas duas funções de localStorage saem junto
const FAVORITES_SEED = ['1', '3']

// Os IDs são sempre normalizados para string: o seed usa números, animais
// criados no mock usam Date.now() e params de rota chegam como texto —
// comparar tudo como string evita um "1 !== '1'" silencioso
function loadStoredFavorites(userId) {
  if (!userId) return [] // sem sessão não existe lista pessoal

  try {
    const stored = localStorage.getItem(favoritesStorageKey(userId))
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed.map(String)
    }
  } catch {
    // payload corrompido — cai para o seed
  }
  return FAVORITES_SEED
}

function persistFavorites(userId, ids) {
  try {
    localStorage.setItem(favoritesStorageKey(userId), JSON.stringify(ids))
  } catch (error) {
    console.warn('Não foi possível salvar os favoritos no localStorage', error)
  }
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  // O estado guarda de quem é a lista. Assim, quando a sessão muda (login,
  // logout ou outra conta no mesmo navegador), a lista do usuário novo é
  // lida já na renderização — sem um efeito que causaria um render extra
  // exibindo os favoritos da sessão anterior
  const [session, setSession] = useState({ userId: null, ids: [] })

  const isCurrentSession = session.userId === userId
  const favoritos = isCurrentSession ? session.ids : loadStoredFavorites(userId)

  if (!isCurrentSession) {
    setSession({ userId, ids: favoritos })
  }

  // Sincroniza em tempo real quando OUTRA aba favorita/desfavorita algo
  useEffect(() => {
    if (!userId) return

    const key = favoritesStorageKey(userId)

    function handleStorageChange(event) {
      if (event.key !== key || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue)
        if (Array.isArray(parsed)) setSession({ userId, ids: parsed.map(String) })
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [userId])

  function isFavorito(petId) {
    return favoritos.includes(String(petId))
  }

  // Retorna false quando não havia sessão — quem chamou usa isso para abrir
  // o convite de login em vez de fingir que salvou
  function toggleFavorito(petId) {
    if (!userId) return false

    const id = String(petId)
    // Recém-favoritado entra no topo: a página /favoritos lista na ordem do
    // array, então o último salvo aparece primeiro
    const next = favoritos.includes(id) ? favoritos.filter((favorito) => favorito !== id) : [id, ...favoritos]

    setSession({ userId, ids: next })
    persistFavorites(userId, next)
    return true
  }

  return (
    <FavoritesContext.Provider value={{ favoritos, isFavorito, toggleFavorito, totalFavoritos: favoritos.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider')
  return context
}
