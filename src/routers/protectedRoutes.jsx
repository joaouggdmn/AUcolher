import { Navigate } from 'react-router-dom'
import PrivateRoute from '../core/guards/PrivateRoute'
import OngRoute from '../core/guards/OngRoute'
import AdminRoute from '../core/guards/AdminRoute'
import UserLayout from '../core/components/layout/UserLayout'
import AdminLayout from '../core/components/layout/AdminLayout'
import PlaceholderPage from '../core/components/PlaceholderPage'
import UserProfilePage from '../features/perfil/pages/UserProfilePage'
import CreateAnimalPage from '../features/animais/pages/CreateAnimalPage'
import ReceivedRequestsPage from '../features/adocao/pages/ReceivedInterestsPage'
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
import ChatLayout from '../core/components/layout/ChatLayout'


export const protectedRoutes = [
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: 'animais/criar', element: <CreateAnimalPage /> },
          { path: 'animais/editar/:id', element: <PlaceholderPage title="Editar animal" /> },
          { path: 'meus-anuncios', element: <PlaceholderPage title="Meus anuncios" /> },
          { path: 'meus-interesses', element: <PlaceholderPage title="Meus interesses" /> },
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
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin/dashboard', element: <PlaceholderPage title="Dashboard admin" /> },
          { path: 'admin/aprovacoes', element: <PlaceholderPage title="Aprovacoes de ONG" /> },
          { path: 'admin/denuncias', element: <PlaceholderPage title="Denuncias" /> },
          { path: 'admin/estatisticas', element: <PlaceholderPage title="Estatisticas" /> },
        ],
      },
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
