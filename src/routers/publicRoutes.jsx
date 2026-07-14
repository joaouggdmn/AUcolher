import PublicLayout from '../core/components/layout/PublicLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import HomePage from '../features/home/pages/HomePage'
import AnimaisListPage from '../features/animais/pages/AnimaisListPage'

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
        path: 'animais',
        element: <AnimaisListPage/>,
      },
      {
        path: 'animais/:id',
        element: <PlaceholderPage title="Detalhes do animal" />,
      },
      {
        path: 'eventos',
        element: <PlaceholderPage title="Eventos" />,
      },
      {
        path: 'eventos/:id',
        element: <PlaceholderPage title="Detalhes do evento" />,
      },
      {
        path: 'campanhas',
        element: <PlaceholderPage title="Campanhas" />,
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
