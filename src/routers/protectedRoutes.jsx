import PrivateRoute from '../core/guards/PrivateRoute'
import OngRoute from '../core/guards/OngRoute'
import AdminRoute from '../core/guards/AdminRoute'
import UserLayout from '../core/components/layout/UserLayout'
import OngLayout from '../core/components/layout/OngLayout'
import AdminLayout from '../core/components/layout/AdminLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import UserProfilePage from '../features/perfil/pages/UserProfilePage'
import CreateAnimalPage from '../features/animais/pages/CreateAnimalPage'
import ReceivedRequestsPage from '../features/adocao/pages/ReceivedInterestsPage'
import ChatPage from '../features/chat/pages/ChatPage'
import FavoritosPage from '../features/favoritos/pages/FavoritosPage'
import EventCreatePage from '../features/eventos/pages/EventCreatePage'
import EventEditPage from '../features/eventos/pages/EventEditPage'
import CampaignCreatePage from '../features/doacoes/pages/CampaignCreatePage'
import CampaignEditPage from '../features/doacoes/pages/CampaignEditPage'
import OngDashboardPage from '../features/ong/pages/OngDashboardPage'
import ChatLayout from '../core/components/layout/ChatLayout'


export const protectedRoutes = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'animais/criar', element: <CreateAnimalPage /> },
          { path: 'animais/editar/:id', element: <PlaceholderPage title="Editar animal" /> },
          { path: 'meus-anuncios', element: <PlaceholderPage title="Meus anuncios" /> },
          { path: 'meus-interesses', element: <PlaceholderPage title="Meus interesses" /> },
          { path: 'favoritos', element: <FavoritosPage /> },
          { path: 'interesses-recebidos', element: <ReceivedRequestsPage /> },
          { path: 'minhas-avaliacoes', element: <PlaceholderPage title="Minhas avaliacoes" /> },
          { path: 'perfil', element: <UserProfilePage /> },
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
          { path: 'ong/dashboard', element: <OngDashboardPage /> },
          { path: 'eventos/criar', element: <EventCreatePage /> },
          { path: 'eventos/editar/:id', element: <EventEditPage /> },
          { path: 'campanhas/criar', element: <CampaignCreatePage /> },
          { path: 'campanhas/editar/:id', element: <CampaignEditPage /> },
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
  {
  element: <PrivateRoute />,
  children: [
    {
      element: <ChatLayout />,
      children: [
        { path: 'chat', element: <ChatPage /> },
      ],
    },
  ],
}
]
