import { createBrowserRouter, Outlet } from 'react-router-dom'
import { publicRoutes } from './publicRoutes'
import { authRoutes } from './authRoutes'
import { protectedRoutes } from './protectedRoutes'
import NotFoundPage from '../core/components/NotFoundPage' // ajuste se mover para core/
import RootErrorPage from '../core/components/RootErrorPage'
import ScrollToTop from '../core/components/layout/ScrollToTop'

export const router = createBrowserRouter([
  {
    path: '/',
    // errorElement no nível raiz captura qualquer erro não tratado
    // em qualquer rota da aplicação
    errorElement: <RootErrorPage />,
    // Toda página nova abre no topo (ScrollToTop explica as exceções)
    element: (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    ),
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
