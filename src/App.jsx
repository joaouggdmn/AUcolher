import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { AuthProvider } from './core/context/AuthContext'
import { AnimalProvider } from './core/context/AnimalContext'
import { AdoptionRequestProvider } from './core/context/AdoptionRequestContext'
import { FavoritesProvider } from './core/context/FavoritesContext'

function App() {
  return (
    <AuthProvider>
      <AnimalProvider>
        <AdoptionRequestProvider>
          {/* Depende do usuário logado (lista privada por conta), então fica
              dentro do AuthProvider */}
          <FavoritesProvider>
            <RouterProvider router={router} />
          </FavoritesProvider>
        </AdoptionRequestProvider>
      </AnimalProvider>
    </AuthProvider>
  )
}

export default App
