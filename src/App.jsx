import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { AuthProvider } from './core/context/AuthContext'
import { AnimalProvider } from './core/context/AnimalContext'

function App() {
  return (
    <AuthProvider>
      <AnimalProvider>
        <RouterProvider router={router} />
      </AnimalProvider>
    </AuthProvider>
  )
}

export default App