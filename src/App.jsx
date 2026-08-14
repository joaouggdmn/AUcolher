import { RouterProvider } from 'react-router-dom'
import { router } from './routers'
import { AuthProvider } from './core/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App