import { createContext, useContext, useEffect, useState } from 'react'

const AUTH_STORAGE_KEY = 'aucolher_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Ao carregar a aplicação, verifica se já existe uma "sessão" mockada salva.
  // Sem isso, um F5 na página derrubaria o usuário mesmo sem ele ter deslogado.
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }

    setIsLoading(false)
  }, [])

  async function login(credentials) {
    // 🔴 Aqui entra a chamada real: const { data } = await api.post('/auth/login', credentials)
    await new Promise((resolve) => setTimeout(resolve, 400)) // simula latência de rede

    // credentials é opcional: aceita { email, senha } vindo do LoginPage,
    // ou nenhum argumento (mock instantâneo, usado pelo AuthRequiredModal)
    const mockUser = {
      id: 1,
      name: credentials?.name ?? 'Usuário Teste',
      email: credentials?.email ?? 'teste@aucolher.com',
      userType: credentials?.userType ?? 'PESSOA',
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
    setIsAuthenticated(true)

    return mockUser
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}