import AuthLayout from './AuthLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import GuestRoute from '../core/guards/GuestRoute'

export const authRoutes = [
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'cadastro',
            element: <RegisterPage />,
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
