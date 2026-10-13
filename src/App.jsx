import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { AuthProvider } from './core/context/AuthContext'
import { AdoptionRequestProvider } from './core/context/AdoptionRequestContext'
import { FavoritesProvider } from './core/context/FavoritesContext'
import { useMockStorageSync } from './core/hooks/useMockStorageSync'

function App() {
  useMockStorageSync()

  return (
    <AuthProvider>
      <AdoptionRequestProvider>
        {/* Depende do usuário logado (lista privada por conta), então fica
            dentro do AuthProvider */}
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </AdoptionRequestProvider>
    </AuthProvider>
  )
}

export default App
