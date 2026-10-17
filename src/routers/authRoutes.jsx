import { Navigate } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import GoogleCallbackPage from '../features/auth/pages/GoogleCallbackPage'
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
            element: <ForgotPasswordPage />,
          },
          {
            // Link do rodapé: o cadastro de ONG é a aba ONG do /cadastro
            path: 'cadastro-ong',
            element: <Navigate to="/cadastro" state={{ preselectUserType: 'ONG' }} replace />,
          },
        ],
      },
    ],
  },
  {
    // Link do e-mail de "Esqueci minha senha": fora do GuestRoute, para quem
    // estiver logado neste navegador não ser mandado para a home sem o token
    element: <AuthLayout />,
    children: [
      {
        path: 'redefinir-senha',
        element: <ResetPasswordPage />,
      },
      {
        // Volta do login com o Google (?code= ou ?error=). Também fora do
        // GuestRoute: a própria página decide o destino depois do login
        path: 'login/google',
        element: <GoogleCallbackPage />,
      },
    ],
  },
]
