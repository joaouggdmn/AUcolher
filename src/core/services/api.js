import axios from 'axios'
import { TOKEN_STORAGE_KEY, TOKEN_TYPE_STORAGE_KEY } from '../utils/storageKeys'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

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
    return Promise.reject(error)
  }
)

export default api