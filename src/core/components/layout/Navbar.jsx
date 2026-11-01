import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { LuSparkles } from 'react-icons/lu'
import { FaHeart } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useProfileCompletion } from '../../hooks/useProfileCompletion'
import { useReceivedRequests } from '../../hooks/useReceivedRequests'
import { useSentRequests } from '../../hooks/useSentRequests'
import { useChatUnread } from '../../hooks/useChatUnread'
import { getPanelLink } from '../../utils/panelLinks'
import UserAvatarMenu from './UserAvatarMenu'
import PlatformSidebar from './PlatformSidebar'
import Logo from '../ui/Logo'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Animais', to: '/animais' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Campanhas', to: '/campanhas' },
]

function Navbar() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const { totalFavoritos } = useFavorites()
  const { percentage } = useProfileCompletion(user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pendingCount } = useReceivedRequests()
  const { activeCount: activeSentCount } = useSentRequests()
  const { unreadCount: unreadChatCount } = useChatUnread()
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const panelLink = getPanelLink(user?.userType)
  const PanelLinkIcon = panelLink?.icon

  // Badge do botão da sidebar: só o que pede atenção (pedidos pendentes e
  // mensagens não lidas). Favoritos não entram — não são novidade.
  const sidebarUpdates = pendingCount + unreadChatCount

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-700 shadow-raised'
            : 'bg-white/80'
        }`}
      >
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-expanded={isSidebarOpen}
                aria-label={
                  sidebarUpdates > 0
                    ? `Abrir menu: ${sidebarUpdates} ${sidebarUpdates === 1 ? 'novidade' : 'novidades'}`
                    : 'Abrir menu'
                }
                className={`relative -ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 ${
                  isScrolled
                    ? 'text-brand-50 hover:bg-white/10 hover:text-accent-300'
                    : 'text-brand-800 hover:bg-brand-50 hover:text-brand-600'
                }`}
              >
                <FiMenu size={22} />

                {sidebarUpdates > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[11px] font-bold text-white ring-2 transition-colors duration-300 ${
                      isScrolled ? 'ring-brand-700' : 'ring-white'
                    }`}
                  >
                    {sidebarUpdates > 9 ? '9+' : sidebarUpdates}
                  </span>
                )}
              </button>
            )}

            <Logo tone={isScrolled ? 'light' : 'dark'} />
          </div>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap md:flex">
            <li>
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isScrolled ? 'text-brand-50 hover:text-accent-300' : 'text-ink-700 hover:text-brand-600'
                }`}
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                to="/aumatch"
                className="group relative mx-1 flex items-center gap-1.5 rounded-control bg-accent-400 px-4 py-2 text-sm font-extrabold text-brand-950 transition-colors duration-200 hover:bg-accent-500"
              >
                <LuSparkles size={15} />
                AUmatch
              </Link>
            </li>

            <li>
              <Link
                to="/animais"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isScrolled ? 'text-brand-50 hover:text-accent-300' : 'text-ink-700 hover:text-brand-600'
                }`}
              >
                Animais
              </Link>
            </li>

            <li>
              <Link
                to="/eventos"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isScrolled ? 'text-brand-50 hover:text-accent-300' : 'text-ink-700 hover:text-brand-600'
                }`}
              >
                Eventos
              </Link>
            </li>

            <li>
              <Link
                to="/campanhas"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isScrolled ? 'text-brand-50 hover:text-accent-300' : 'text-ink-700 hover:text-brand-600'
                }`}
              >
                Campanhas
              </Link>
            </li>
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            {isLoading ? (
              <div className="h-11 w-11 animate-pulse rounded-full bg-line" />
            ) : isAuthenticated ? (
              <>
                {/* Só em telas largas: abaixo disso encostaria nos links do
                    centro, e o painel continua no menu lateral e no do avatar */}
                {panelLink && (
                  <Link
                    to={panelLink.to}
                    className={`hidden items-center gap-2 rounded-control px-4 py-2 text-sm font-bold transition-colors duration-200 xl:flex ${
                      isScrolled
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-brand-700 text-white hover:bg-brand-800'
                    }`}
                  >
                    <PanelLinkIcon size={13} className="text-accent-300" />
                    {panelLink.label}
                  </Link>
                )}

                {/* Atalho para /favoritos com o contador global — pessoa e ONG; o
                    admin modera, mas não favorita */}
                {user?.userType !== 'ADMIN' && (
                  <Link
                    to="/favoritos"
                    aria-label={
                      totalFavoritos > 0
                        ? `Meus favoritos: ${totalFavoritos} ${totalFavoritos === 1 ? 'pet salvo' : 'pets salvos'}`
                        : 'Meus favoritos'
                    }
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-600 focus-visible:ring-offset-2 ${
                      isScrolled
                        ? 'text-brand-50 hover:bg-white/10 hover:text-danger-600'
                        : 'text-ink-600 hover:bg-danger-50 hover:text-danger-600'
                    }`}
                  >
                    <FaHeart size={19} />

                    {totalFavoritos > 0 && (
                      <span
                        aria-hidden="true"
                        className={`absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[11px] font-bold text-white ring-2 transition-colors duration-300 ${
                          isScrolled ? 'ring-brand-700' : 'ring-white'
                        }`}
                      >
                        {totalFavoritos > 9 ? '9+' : totalFavoritos}
                      </span>
                    )}
                  </Link>
                )}

                <UserAvatarMenu
                  user={user}
                  percentage={percentage}
                  onLogout={logout}
                  isScrolled={isScrolled}
                  onOpenChange={(open) => open && setIsMenuOpen(false)}
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden rounded-control border px-5 py-2 text-sm font-bold transition-colors duration-200 sm:inline-block ${
                    isScrolled
                      ? 'border-white/60 text-white hover:bg-white/10'
                      : 'border-line-strong text-ink-700 hover:border-brand-700 hover:text-brand-700'
                  }`}
                >
                  Entrar
                </Link>

                <Link
                  to="/cadastro"
                  className={`rounded-control px-5 py-2 text-sm font-bold transition-colors duration-200 ${
                    isScrolled
                      ? 'bg-accent-400 text-brand-950 hover:bg-accent-500'
                      : 'bg-brand-700 text-white hover:bg-brand-800'
                  }`}
                >
                  Cadastrar-se
                </Link>
              </>
            )}

            {/* Logado, a navegação mobile vive na sidebar — um único menu */}
            {!isAuthenticated && (
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`ml-1 md:hidden ${isScrolled ? 'text-white' : 'text-brand-800'}`}
                aria-label="Abrir menu"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
          </div>
        </nav>

        {isMenuOpen && !isAuthenticated && (
          <ul className={`flex flex-col gap-1 px-6 pb-4 md:hidden ${isScrolled ? 'bg-brand-700' : 'bg-white'}`}>
            {[{ label: 'Início', to: '/' }, { label: 'AUmatch', to: '/aumatch', isPremium: true }, ...NAV_LINKS.slice(1)].map(
              (link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={
                      link.isPremium
                        ? 'my-1 flex items-center gap-2 rounded-control bg-accent-400 px-3 py-2.5 text-sm font-extrabold text-brand-950'
                        : `block rounded-control px-3 py-2 text-sm font-semibold ${
                            isScrolled ? 'text-brand-50 hover:bg-brand-600' : 'text-ink-700 hover:bg-paper'
                          }`
                    }
                  >
                    {link.isPremium && <LuSparkles size={16} />}
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </header>

      {/* Fora do <header>: um backdrop-blur ou transform nele viraria o bloco
          de contenção do position:fixed e prenderia a sidebar dentro da navbar */}
      {isAuthenticated && (
        <PlatformSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          panelLink={panelLink}
          userType={user?.userType}
          totalFavoritos={totalFavoritos}
          activeSentCount={activeSentCount}
          pendingCount={pendingCount}
          unreadChatCount={unreadChatCount}
        />
      )}
    </>
  )
}

export default Navbar