import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import BrandWord from '../ui/BrandWord'
import UserAvatarMenu from './UserAvatarMenu'
import PlatformSidebar from './PlatformSidebar'

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
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pendingCount } = useReceivedRequests()
  const { activeCount: activeSentCount } = useSentRequests()
  const { unreadCount: unreadChatCount } = useChatUnread()
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const panelLink = getPanelLink(user?.userType)
  const PanelLinkIcon = panelLink?.icon

  // Verde ao rolar a página. O AUmatch tem fundo escuro desde o topo: lá ela
  // já nasce verde, porque o branco translúcido ficaria cinza sobre esse fundo
  const isOnAumatch = pathname.startsWith('/aumatch')
  const isDark = isScrolled || isOnAumatch

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
          isDark
            ? 'bg-emerald-800/95 shadow-lg shadow-emerald-950/10 backdrop-blur-sm'
            : 'bg-white/80 backdrop-blur-sm'
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
                className={`relative -ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 ${
                  isDark
                    ? 'text-emerald-50 hover:bg-white/10 hover:text-amber-300'
                    : 'text-emerald-900 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <FiMenu size={22} />

                {sidebarUpdates > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 transition-colors duration-300 ${
                      isDark ? 'ring-emerald-800' : 'ring-white'
                    }`}
                  >
                    {sidebarUpdates > 9 ? '9+' : sidebarUpdates}
                  </span>
                )}
              </button>
            )}

            <Link to="/" className="flex items-center text-2xl font-black tracking-tight">
              <BrandWord tone={isDark ? 'dark' : 'light'} />
            </Link>
          </div>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap md:flex">
            <li>
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Início
              </Link>
            </li>

            <li>
              {/* Destaque sem caixa: o nome nas cores da marca, como o logo. O
                  traço dourado aparece no hover e na própria página do AUmatch */}
              <Link
                to="/aumatch"
                className={`group relative flex items-center gap-1.5 px-3 py-2 text-sm font-extrabold after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-amber-400 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  isOnAumatch ? 'after:scale-x-100' : 'after:scale-x-0'
                }`}
              >
                <LuSparkles
                  size={15}
                  className={`transition-transform duration-300 group-hover:rotate-12 ${isDark ? 'text-amber-300' : 'text-amber-500'}`}
                />
                <span>
                  <BrandWord suffix="match" tone={isDark ? 'dark' : 'light'} />
                </span>
              </Link>
            </li>

            <li>
              <Link
                to="/animais"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Animais
              </Link>
            </li>

            <li>
              <Link
                to="/eventos"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Eventos
              </Link>
            </li>

            <li>
              <Link
                to="/campanhas"
                className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isDark ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Campanhas
              </Link>
            </li>
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            {isLoading ? (
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
            ) : isAuthenticated ? (
              <>
                {/* Só em telas largas: abaixo disso encostaria nos links do
                    centro, e o painel continua no menu lateral e no do avatar */}
                {panelLink && (
                  <Link
                    to={panelLink.to}
                    className={`hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300 xl:flex ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-emerald-800 text-white hover:bg-emerald-900'
                    }`}
                  >
                    <PanelLinkIcon size={13} className="text-amber-300" />
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
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
                      isDark
                        ? 'text-emerald-50 hover:bg-white/10 hover:text-rose-300'
                        : 'text-slate-600 hover:bg-rose-50 hover:text-rose-500'
                    }`}
                  >
                    <FaHeart size={19} />

                    {totalFavoritos > 0 && (
                      <span
                        aria-hidden="true"
                        className={`absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 transition-colors duration-300 ${
                          isDark ? 'ring-emerald-800' : 'ring-white'
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
                  isDark={isDark}
                  onOpenChange={(open) => open && setIsMenuOpen(false)}
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden rounded-lg border px-5 py-2 text-sm font-bold transition-all duration-300 sm:inline-block ${
                    isDark
                      ? 'border-white/60 text-white hover:bg-white/10'
                      : 'border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  Entrar
                </Link>

                <Link
                  to="/cadastro"
                  className={`rounded-lg px-5 py-2 text-sm font-bold shadow-md transition-all duration-300 ${
                    isDark
                      ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300'
                      : 'bg-emerald-800 text-white hover:bg-emerald-900'
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
                className={`ml-1 md:hidden ${isDark ? 'text-white' : 'text-emerald-900'}`}
                aria-label="Abrir menu"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
          </div>
        </nav>

        {isMenuOpen && !isAuthenticated && (
          <ul className={`flex flex-col gap-1 px-6 pb-4 md:hidden ${isDark ? 'bg-emerald-800' : 'bg-white'}`}>
            {[{ label: 'Início', to: '/' }, { label: 'AUmatch', to: '/aumatch', isPremium: true }, ...NAV_LINKS.slice(1)].map(
              (link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={
                      link.isPremium
                        ? `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-amber-50'
                          }`
                        : `block rounded-lg px-3 py-2 text-sm font-semibold ${
                            isDark ? 'text-emerald-50 hover:bg-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                          }`
                    }
                  >
                    {link.isPremium ? (
                      <>
                        <LuSparkles size={16} className={isDark ? 'text-amber-300' : 'text-amber-500'} />
                        <span>
                          <BrandWord suffix="match" tone={isDark ? 'dark' : 'light'} />
                        </span>
                      </>
                    ) : (
                      link.label
                    )}
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </header>

      {/* Fora do <header>: o backdrop-blur dele viraria o bloco de contenção
          do position:fixed e prenderia a sidebar dentro da navbar */}
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