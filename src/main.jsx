import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './core/context/AuthContext'
import { router } from './routers'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // cache de 5 min como padrão global
      retry: 1,                  // tenta 1x antes de lançar erro
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 
          RouterProvider substitui completamente o BrowserRouter.
          Ele é o ponto de entrada do createBrowserRouter.
        */}
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
) 
