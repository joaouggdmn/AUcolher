import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { AuthProvider } from './core/context/AuthContext'
import { AnimalProvider } from './core/context/AnimalContext'
import { AdoptionRequestProvider } from './core/context/AdoptionRequestContext'

function App() {
  return (
    <AuthProvider>
      <AnimalProvider>
        <AdoptionRequestProvider>
          <RouterProvider router={router} />
        </AdoptionRequestProvider>
      </AnimalProvider>
    </AuthProvider>
  )
}

export default App