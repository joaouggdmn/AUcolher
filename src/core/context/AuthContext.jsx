import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, registerRequest } from '../services/authService'
import { TOKEN_STORAGE_KEY, TOKEN_TYPE_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/storageKeys'

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
        setUser(JSON.parse(storedUser))
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

  // 🆕 Agora exige userType, para escolher /login/user ou /login/ong
  async function login({ email, password, userType }) {
    const { token, tokenType, user: loggedUser } = await loginRequest({ email, password, userType })

    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))

    setUser(loggedUser)
    setIsAuthenticated(true)

    return loggedUser
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

  function updateProfile(updates) {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
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