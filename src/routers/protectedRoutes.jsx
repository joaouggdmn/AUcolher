import PrivateRoute from '../core/guards/PrivateRoute'
import OngRoute from '../core/guards/OngRoute'
import AdminRoute from '../core/guards/AdminRoute'

import UserLayout from '../core/components/layout/UserLayout'
import OngLayout from '../core/components/layout/OngLayout'
import AdminLayout from '../core/components/layout/AdminLayout'

// — Páginas de Usuário Comum —
import AnimalCreatePage from '../features/animais/pages/AnimalCreatePage'
import AnimalEditPage from '../features/animais/pages/AnimalEditPage'
import MyAnimaisPage from '../features/animais/pages/MyAnimaisPage'
import MyInterestsPage from '../features/adocao/pages/MyInterestsPage'
import ReceivedInterestsPage from '../features/adocao/pages/ReceivedInterestsPage'
import ChatPage from '../features/chat/pages/ChatPage'
import MyReviewsPage from '../features/avaliacoes/pages/MyReviewsPage'
import ProfilePage from '../features/perfil/pages/ProfilePage'

// — Páginas de ONG —
import OngDashboardPage from '../features/ong/pages/OngDashboardPage'
import EventCreatePage from '../features/eventos/pages/EventCreatePage'
import EventEditPage from '../features/eventos/pages/EventEditPage'
import CampaignCreatePage from '../features/doacoes/pages/CampaignCreatePage'

// — Páginas de Admin —
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'
import OngApprovalsPage from '../features/admin/pages/OngApprovalsPage'
import ReportsPage from '../features/admin/pages/ReportsPage'
import StatisticsPage from '../features/admin/pages/StatisticsPage'

export const protectedRoutes = [

  // ─────────────────────────────────────────
  // GRUPO 1: Usuário Comum
  // Guard → Layout → Páginas
  // ─────────────────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'animais/criar',          element: <AnimalCreatePage /> },
          { path: 'animais/editar/:id',     element: <AnimalEditPage /> },
          { path: 'meus-anuncios',          element: <MyAnimaisPage /> },
          { path: 'meus-interesses',        element: <MyInterestsPage /> },
          { path: 'interesses-recebidos',   element: <ReceivedInterestsPage /> },
          { path: 'chat',                   element: <ChatPage /> },
          { path: 'minhas-avaliacoes',      element: <MyReviewsPage /> },
          { path: 'perfil',                 element: <ProfilePage /> },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // GRUPO 2: ONG Verificada
  // OngRoute já inclui verificação de PrivateRoute internamente
  // ─────────────────────────────────────────
  {
    element: <OngRoute />,
    children: [
      {
        element: <OngLayout />,
        children: [
          { path: 'ong/dashboard',          element: <OngDashboardPage /> },
          { path: 'eventos/criar',          element: <EventCreatePage /> },
          { path: 'eventos/editar/:id',     element: <EventEditPage /> },
          { path: 'campanhas/criar',        element: <CampaignCreatePage /> },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // GRUPO 3: Administrador
  // AdminRoute já inclui verificação de PrivateRoute internamente
  // ─────────────────────────────────────────
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin/dashboard',        element: <AdminDashboardPage /> },
          { path: 'admin/aprovacoes',       element: <OngApprovalsPage /> },
          { path: 'admin/denuncias',        element: <ReportsPage /> },
          { path: 'admin/estatisticas',     element: <StatisticsPage /> },
        ],
      },
    ],
  },
] 
