import PublicLayout from '../core/components/layout/PublicLayout'
import HomePage from '../features/home/pages/HomePage'
import AnimaisListPage from '../features/animais/pages/AnimaisListPage'
import AnimalDetailPage from '../features/animais/pages/AnimalDetailPage'
import EventsListPage from '../features/eventos/pages/EventsListPage'
import EventDetailPage from '../features/eventos/pages/EventDetailPage'
import CampaignsListPage from '../features/doacoes/pages/CampaignsListPage'
import CampaignDetailPage from '../features/doacoes/pages/CampaignDetailPage'
import OngProfilePage from '../features/ong/pages/OngProfilePage'
import PublicProfilePage from '../features/perfil/pages/PublicProfilePage'

export const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,          // Rota raiz "/"
        element: <HomePage />,
      },
      {
        path: 'animais',
        element: <AnimaisListPage />,
      },
      {
        path: 'animais/:id',
        element: <AnimalDetailPage />,
      },
      {
        path: 'eventos',
        element: <EventsListPage />,
      },
      {
        path: 'eventos/:id',
        element: <EventDetailPage />,
      },
      {
        path: 'campanhas',
        element: <CampaignsListPage />,
      },
      {
        path: 'campanhas/:id',
        element: <CampaignDetailPage />,
      },
      {
        path: 'ong/:id',
        element: <OngProfilePage />,
      },
      {
        path: 'perfil/publico/:id',
        element: <PublicProfilePage />,
      },
    ],
  },
] 
