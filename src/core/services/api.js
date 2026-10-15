import axios from 'axios'
import { TOKEN_STORAGE_KEY, TOKEN_TYPE_STORAGE_KEY } from '../utils/storageKeys'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Conta banida pela moderação: o login e qualquer requisição com um token
// emitido antes do banimento respondem 403 com esta frase
export const ACCOUNT_SUSPENDED_MESSAGE = 'Esta conta foi suspensa pela moderação do AUcolher.'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || 'Bearer'
    config.headers.Authorization = `${tokenType} ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    if (error.response?.status === 403 && error.response.data?.message === ACCOUNT_SUSPENDED_MESSAGE) {
      window.dispatchEvent(new Event('auth:suspended'))
    }
    return Promise.reject(error)
  }
)

export default api