import { createContext, useContext, useEffect, useState } from 'react'

const AUTH_STORAGE_KEY = 'aucolher_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
    await new Promise((resolve) => setTimeout(resolve, 400))

    const mockUser = {
      id: 1,
      name: credentials?.name ?? 'Usuário Teste',
      email: credentials?.email ?? 'teste@aucolher.com',
      userType: credentials?.userType ?? 'PESSOA',
      // Mock de foto para testarmos o Avatar por toda a aplicação —
      // troque para null para simular um usuário que ainda não tem foto
      photoUrl:
        credentials?.photoUrl ??
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
      telefone: '',
      cidade: '',
      estado: '',
      moradia: '',
      rotinaExercicio: '',
      tempoSozinho: '',
      temCriancasOuPets: null,
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

  // Mescla parcialmente e persiste — usado pela UserProfilePage ao salvar.
  // Como setUser dispara novo render em qualquer componente que consome
  // useAuth(), a Navbar reflete a mudança automaticamente, sem prop drilling.
  function updateProfile(updates) {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
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