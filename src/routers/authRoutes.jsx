import PublicLayout from '../core/components/layout/PublicLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import LoginPage from '../features/auth/pages/LoginPage'
import GuestRoute from '../core/guards/GuestRoute'

export const authRoutes = [
  {
    element: <GuestRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'cadastro',
            element: <PlaceholderPage title="Cadastro" />,
          },
          {
            path: 'recuperar-senha',
            element: <PlaceholderPage title="Recuperar senha" />,
          },
          {
            path: 'cadastro-ong',
            element: <PlaceholderPage title="Cadastro de ONG" />,
          },
        ],
      },
    ],
  },
]
