import PublicLayout from '../core/components/layout/PublicLayout'
import HomePage from '../features/home/pages/HomePage'
import AnimaisListPage from '../features/animais/pages/AnimaisListPage'
import AnimalDetailPage from '../features/animais/pages/AnimalDetailPage'
import EventsListPage from '../features/eventos/pages/EventsListPage'
import EventDetailPage from '../features/eventos/pages/EventDetailPage'
import CampaignsListPage from '../features/doacoes/pages/CampaignsListPage'
import CampaignDetailPage from '../features/doacoes/pages/CampaignDetailPage'
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
        element: <PublicProfilePage />,
      },
      {
        path: 'perfil/publico/:id',
        element: <PublicProfilePage />,
      },
    ],
  },
]
