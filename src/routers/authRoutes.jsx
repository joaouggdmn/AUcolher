import { Navigate } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
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
]
