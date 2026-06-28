import PublicLayout from '../core/components/layout/PublicLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import OngRegisterPage from '../features/ong/pages/OngRegisterPage'
import GuestRoute from '../core/guards/GuestRoute'

export const authRoutes = [
  {
    // GuestRoute: redireciona para "/" se o usuário JÁ estiver logado
    // Evita que alguém logado acesse /login ou /cadastro manualmente
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
            element: <RegisterPage />,
          },
          {
            path: 'recuperar-senha',
            element: <ForgotPasswordPage />,
          },
          {
            path: 'cadastro-ong',
            element: <OngRegisterPage />,
          },
        ],
      },
    ],
  },
] 
