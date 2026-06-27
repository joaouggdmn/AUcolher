import { createContext, useContext } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: false,
  user: null,
})

export function AuthProvider({ children }) {
  return children
}

export function useAuth() {
  return useContext(AuthContext)
}
    