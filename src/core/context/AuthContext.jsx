import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, registerRequest } from '../services/authService'
import {
  TOKEN_STORAGE_KEY,
  TOKEN_TYPE_STORAGE_KEY,
  USER_STORAGE_KEY,
  LIFESTYLE_PROFILE_STORAGE_KEY,
} from '../utils/storageKeys'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Sessão salva antes da API em inglês (usuário com `cidade`/`estado`):
        // descarta e pede um novo login, que traz o perfil no formato atual
        if ('cidade' in parsedUser) throw new Error('sessão em formato antigo')
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  // Só e-mail e senha — o papel (userType) vem do payload da API
  async function login({ email, password }) {
    const { token, tokenType, user: loggedUser } = await loginRequest({ email, password })

    // 🆕 Sem isso, cada novo login apagava silenciosamente as respostas do
    // quiz que o usuário já tinha dado — o backend não devolve esses
    // campos (toFrontendUser sempre reseta para vazio)
    // O perfil público (bio, redes, endereço, cidade/UF, equipe...) vem
    // inteiro da API: "Minha conta" salva pelo PUT /users/me
    const storedLifestyle = loadStoredLifestyleProfile()
    const mergedUser = { ...loggedUser, ...storedLifestyle }

    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser))

    setUser(mergedUser)
    setIsAuthenticated(true)

    return mergedUser
  }

  async function register(formData) {
    return registerRequest(formData)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  // Só atualiza a sessão local — quem precisa gravar no banco chama a API
  // antes (ver useAccountForm, que usa o PUT /users/me)
  function updateProfile(updates) {
    persistLifestyleFields(updates)

    setUser((prev) => {
      const updatedUser = { ...prev, ...updates }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  // 🆕 Campos que o backend ainda não guarda (coordenadas e Perfil AUmatch),
// persistidos numa chave própria, independente da sessão de autenticação.
// Cidade, UF e CEP NÃO entram aqui: eles têm coluna no banco, e uma cópia
// local sobrescreveria no login o que a API acabou de devolver
const LIFESTYLE_FIELDS = [
  'latitude', 'longitude',
  'moradia', 'rotinaExercicio', 'tempoForaCasa',
  'temCriancasOuPets', 'speciesPreference', 'idealPetProfile', 'portePreferido',
]

// Só devolve os campos da lista acima — descarta chaves que versões antigas
// guardaram aqui (cidade, estado, cep) e que agora vêm do banco
function loadStoredLifestyleProfile() {
  try {
    const stored = localStorage.getItem(LIFESTYLE_PROFILE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Object.fromEntries(Object.entries(parsed).filter(([key]) => LIFESTYLE_FIELDS.includes(key)))
    }
  } catch {
    // payload corrompido — ignora
  }
  return {}
}

function persistLifestyleFields(updates) {
  const relevant = Object.fromEntries(
    Object.entries(updates).filter(([key]) => LIFESTYLE_FIELDS.includes(key))
  )
  if (Object.keys(relevant).length === 0) return
  const current = loadStoredLifestyleProfile()
  localStorage.setItem(LIFESTYLE_PROFILE_STORAGE_KEY, JSON.stringify({ ...current, ...relevant }))
}

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}