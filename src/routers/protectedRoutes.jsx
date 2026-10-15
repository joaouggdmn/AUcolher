import { Navigate } from 'react-router-dom'
import PrivateRoute from '../core/guards/PrivateRoute'
import OngRoute from '../core/guards/OngRoute'
import AdminRoute from '../core/guards/AdminRoute'
import PessoaRoute from '../core/guards/PessoaRoute'
import UserLayout from '../core/components/layout/UserLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import UserProfilePage from '../features/perfil/pages/UserProfilePage'
import CreateAnimalPage from '../features/animais/pages/CreateAnimalPage'
import EditAnimalPage from '../features/animais/pages/EditAnimalPage'
import MyAnimalsPage from '../features/animais/pages/MyAnimalsPage'
import { MY_ANIMALS_PATH } from '../features/animais/utils/myAnimalsPaths'
import ReceivedRequestsPage from '../features/adocao/pages/ReceivedInterestsPage'
import MyInterestsPage from '../features/adocao/pages/MyInterestsPage'
import ChatPage from '../features/chat/pages/ChatPage'
import FavoritosPage from '../features/favoritos/pages/FavoritosPage'
import OngPanelLayout from '../features/ong/panel/OngPanelLayout'
import LegacyFormRedirect from '../features/ong/panel/LegacyFormRedirect'
import { PANEL_PATHS } from '../features/ong/panel/panelPaths'
import OverviewPage from '../features/ong/panel/pages/OverviewPage'
import AnimalsPage from '../features/ong/panel/pages/AnimalsPage'
import AnimalFormPage from '../features/ong/panel/pages/AnimalFormPage'
import RequestsPage from '../features/ong/panel/pages/RequestsPage'
import ChatsPage from '../features/ong/panel/pages/ChatsPage'
import EventsPage from '../features/ong/panel/pages/EventsPage'
import CampaignsPage from '../features/ong/panel/pages/CampaignsPage'
import DonationsPage from '../features/ong/panel/pages/DonationsPage'
import EventFormPage from '../features/ong/panel/pages/EventFormPage'
import CampaignFormPage from '../features/ong/panel/pages/CampaignFormPage'
import ReviewsPage from '../features/ong/panel/pages/ReviewsPage'
import ProfilePage from '../features/ong/panel/pages/ProfilePage'
import ChatLayout from '../core/components/layout/ChatLayout'
import AdminPanelLayout from '../features/admin/panel/AdminPanelLayout'
import { ADMIN_PATHS } from '../features/admin/panel/adminPaths'
import AdminOverviewPage from '../features/admin/pages/AdminOverviewPage'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage'
import AdminAnimalsPage from '../features/admin/pages/AdminAnimalsPage'
import AdminCampaignsPage from '../features/admin/pages/AdminCampaignsPage'
import AdminEventsPage from '../features/admin/pages/AdminEventsPage'
import AdminReportsPage from '../features/admin/pages/AdminReportsPage'


export const protectedRoutes = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'animais/criar', element: <CreateAnimalPage /> },
          { path: 'animais/editar/:id', element: <EditAnimalPage /> },
          // "Meus anúncios" virou a aba "Anunciados por mim" de Meus animais
          { path: 'meus-anuncios', element: <Navigate to={MY_ANIMALS_PATH} replace /> },
          {
            element: <PessoaRoute />,
            children: [{ path: 'meus-animais', element: <MyAnimalsPage /> }],
          },
          { path: 'meus-interesses', element: <MyInterestsPage /> },
          { path: 'favoritos', element: <FavoritosPage /> },
          { path: 'interesses-recebidos', element: <ReceivedRequestsPage /> },
          { path: 'minhas-avaliacoes', element: <PlaceholderPage title="Minhas avaliacoes" /> },
          { path: 'perfil', element: <UserProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <OngRoute />,
    children: [
      // Tela própria, sem a navbar do site (como o chat)
      {
        path: 'ong/painel',
        element: <OngPanelLayout />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'animais', element: <AnimalsPage /> },
          { path: 'animais/novo', element: <AnimalFormPage /> },
          { path: 'animais/:id/editar', element: <AnimalFormPage /> },
          { path: 'pedidos', element: <RequestsPage /> },
          { path: 'conversas', element: <ChatsPage /> },
          { path: 'eventos', element: <EventsPage /> },
          { path: 'eventos/novo', element: <EventFormPage /> },
          { path: 'eventos/:id/editar', element: <EventFormPage /> },
          { path: 'campanhas', element: <CampaignsPage /> },
          { path: 'campanhas/nova', element: <CampaignFormPage /> },
          { path: 'campanhas/:id/editar', element: <CampaignFormPage /> },
          { path: 'doacoes', element: <DonationsPage /> },
          { path: 'avaliacoes', element: <ReviewsPage /> },
          { path: 'perfil', element: <ProfilePage /> },
        ],
      },
      // Endereços antigos: os formulários agora ficam dentro do painel
      { path: 'ong/dashboard', element: <Navigate to={PANEL_PATHS.overview} replace /> },
      { path: 'eventos/criar', element: <LegacyFormRedirect to={PANEL_PATHS.eventNew} /> },
      { path: 'eventos/editar/:id', element: <LegacyFormRedirect to={PANEL_PATHS.eventEdit} /> },
      { path: 'campanhas/criar', element: <LegacyFormRedirect to={PANEL_PATHS.campaignNew} /> },
      { path: 'campanhas/editar/:id', element: <LegacyFormRedirect to={PANEL_PATHS.campaignEdit} /> },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      // Tela própria, sem a navbar do site (como o painel da ONG)
      {
        path: 'admin',
        element: <AdminPanelLayout />,
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: 'usuarios', element: <AdminUsersPage /> },
          { path: 'animais', element: <AdminAnimalsPage /> },
          { path: 'campanhas', element: <AdminCampaignsPage /> },
          { path: 'eventos', element: <AdminEventsPage /> },
          { path: 'denuncias', element: <AdminReportsPage /> },
        ],
      },
      // Endereços dos antigos placeholders (a aprovação de ONG deixou de existir)
      { path: 'admin/dashboard', element: <Navigate to={ADMIN_PATHS.overview} replace /> },
      { path: 'admin/estatisticas', element: <Navigate to={ADMIN_PATHS.overview} replace /> },
      { path: 'admin/aprovacoes', element: <Navigate to={ADMIN_PATHS.overview} replace /> },
    ],
  },
  {
  element: <PrivateRoute />,
  children: [
    {
      element: <ChatLayout />,
      children: [
        { path: 'chat', element: <ChatPage /> },
      ],
    },
  ],
}
]
