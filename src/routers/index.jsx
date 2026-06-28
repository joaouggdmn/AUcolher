import { createBrowserRouter } from 'react-router-dom'
import { publicRoutes } from './publicRoutes'
import { authRoutes } from './authRoutes'
import { protectedRoutes } from './protectedRoutes'
import NotFoundPage from '../features/admin/pages/NotFoundPage' // ajuste se mover para core/
import RootErrorPage from '../core/components/RootErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    // errorElement no nível raiz captura qualquer erro não tratado
    // em qualquer rota da aplicação
    errorElement: <RootErrorPage />,
    children: [
      // Ordem importa: rotas mais específicas antes das genéricas
      ...authRoutes,
      ...protectedRoutes,
      ...publicRoutes,

      // Curinga: qualquer path não encontrado cai aqui
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]) 
