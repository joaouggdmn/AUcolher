import PublicLayout from '../core/components/layout/PublicLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import HomePage from '../features/home/pages/HomePage'
import AnimaisListPage from '../features/animais/pages/AnimaisListPage'
import EventsListPage from '../features/eventos/pages/EventsListPage'
import CampaingsListPage from '../features/doacoes/pages/CampaignsListPage'
import AumatchPage from '../features/aumatch/pages/AumatchPage'

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
        element: <PlaceholderPage title="Detalhes do animal" />,
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
        element: <PlaceholderPage title="Perfil da ONG" />,
      },
      {
        path: 'perfil/publico/:id',
        element: <PlaceholderPage title="Perfil publico" />,
      },
    ],
  },
]
