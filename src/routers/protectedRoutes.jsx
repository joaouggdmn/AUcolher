import PrivateRoute from '../core/guards/PrivateRoute'
import OngRoute from '../core/guards/OngRoute'
import AdminRoute from '../core/guards/AdminRoute'

import UserLayout from '../core/components/layout/UserLayout'
import OngLayout from '../core/components/layout/OngLayout'
import AdminLayout from '../core/components/layout/AdminLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'

export const protectedRoutes = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'animais/criar', element: <PlaceholderPage title="Criar animal" /> },
          { path: 'animais/editar/:id', element: <PlaceholderPage title="Editar animal" /> },
          { path: 'meus-anuncios', element: <PlaceholderPage title="Meus anuncios" /> },
          { path: 'meus-interesses', element: <PlaceholderPage title="Meus interesses" /> },
          { path: 'interesses-recebidos', element: <PlaceholderPage title="Interesses recebidos" /> },
          { path: 'chat', element: <PlaceholderPage title="Chat" /> },
          { path: 'minhas-avaliacoes', element: <PlaceholderPage title="Minhas avaliacoes" /> },
          { path: 'perfil', element: <PlaceholderPage title="Perfil" /> },
        ],
      },
    ],
  },
  {
    element: <OngRoute />,
    children: [
      {
        element: <OngLayout />,
        children: [
          { path: 'ong/dashboard', element: <PlaceholderPage title="Dashboard da ONG" /> },
          { path: 'eventos/criar', element: <PlaceholderPage title="Criar evento" /> },
          { path: 'eventos/editar/:id', element: <PlaceholderPage title="Editar evento" /> },
          { path: 'campanhas/criar', element: <PlaceholderPage title="Criar campanha" /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin/dashboard', element: <PlaceholderPage title="Dashboard admin" /> },
          { path: 'admin/aprovacoes', element: <PlaceholderPage title="Aprovacoes de ONG" /> },
          { path: 'admin/denuncias', element: <PlaceholderPage title="Denuncias" /> },
          { path: 'admin/estatisticas', element: <PlaceholderPage title="Estatisticas" /> },
        ],
      },
    ],
  },
]
