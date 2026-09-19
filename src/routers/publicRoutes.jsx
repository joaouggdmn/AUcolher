import PublicLayout from '../core/components/layout/PublicLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import HomePage from '../features/home/pages/HomePage'
import AnimaisListPage from '../features/animais/pages/AnimaisListPage'
import AnimalDetailPage from '../features/animais/pages/AnimalDetailPage'
import EventsListPage from '../features/eventos/pages/EventsListPage'
import CampaingsListPage from '../features/doacoes/pages/CampaignsListPage'
import AumatchPage from '../features/aumatch/pages/AumatchPage'
import PublicProfilePage from '../features/perfil/pages/PublicProfilePage'

export const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'aumatch',
        element: <AumatchPage />,
      },
      {
        path: 'animais',
        element: <AnimaisListPage/>,
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
        element: <PlaceholderPage title="Detalhes do evento" />,
      },
      {
        path: 'campanhas',
        element: <CampaingsListPage />,
      },
      {
        path: 'campanhas/:id',
        element: <PlaceholderPage title="Detalhes da campanha" />,
      },
      {
        path: 'ong/:id',
        element: <PublicProfilePage />,
      },
      {
        path: 'perfil/publico/:id',
        element: <PublicProfilePage />,
      },
    ],
  },
]
