import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { LuSparkles } from 'react-icons/lu'
import { useAuth } from '../../context/AuthContext'
import { useProfileCompletion } from '../../hooks/useProfileCompletion'
import UserAvatarMenu from './UserAvatarMenu'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Animais', to: '/animais' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Campanhas', to: '/campanhas' },
]

function Navbar() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const { percentage } = useProfileCompletion(user)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-emerald-800/95 shadow-lg shadow-emerald-950/10 backdrop-blur-sm'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex shrink-0 items-center text-2xl font-black tracking-tight">
          <span className={`transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-emerald-900'}`}>
            AU
          </span>
          <span className="text-amber-500">colher</span>
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap md:flex">
          <li>
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                isScrolled ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              Início
            </Link>
          </li>

          <li>
            <Link
              to="/aumatch"
              className="group relative mx-1 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-extrabold text-emerald-950 shadow-[0_0_0_0_rgba(217,119,6,0.5)] transition-all duration-300 animate-glow hover:scale-105 hover:from-amber-300 hover:to-amber-400"
            >
              <LuSparkles size={15} className="transition-transform duration-300 group-hover:rotate-12" />
              AUmatch
            </Link>
          </li>

          <li>
            <Link
              to="/animais"
              className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                isScrolled ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              Animais
            </Link>
          </li>

          <li>
            <Link
              to="/eventos"
              className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                isScrolled ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
              }`}
            >
              Eventos
            </Link>
          </li>

          <li>
            <Link
              to="/campanhas"
              className={`px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                isScrolled ? 'text-emerald-50 hover:text-amber-300' : 'text-slate-700 hover:text-emerald-700'
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
            <UserAvatarMenu
              user={user}
              percentage={percentage}
              onLogout={logout}
              isScrolled={isScrolled}
              onOpenChange={(open) => open && setIsMenuOpen(false)}
            />
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden rounded-full border px-5 py-2 text-sm font-bold transition-all duration-300 sm:inline-block ${
                  isScrolled
                    ? 'border-white/60 text-white hover:bg-white/10'
                    : 'border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'
                }`}
              >
                Entrar
              </Link>

              <Link
                to="/cadastro"
                className={`rounded-full px-5 py-2 text-sm font-bold shadow-md transition-all duration-300 ${
                  isScrolled
                    ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300'
                    : 'bg-emerald-800 text-white hover:bg-emerald-900'
                }`}
              >
                Cadastrar-se
              </Link>
            </>
          )}

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`ml-1 md:hidden ${isScrolled ? 'text-white' : 'text-emerald-900'}`}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <ul className={`flex flex-col gap-1 px-6 pb-4 md:hidden ${isScrolled ? 'bg-emerald-800' : 'bg-white'}`}>
          {[{ label: 'Início', to: '/' }, { label: 'AUmatch', to: '/aumatch', isPremium: true }, ...NAV_LINKS.slice(1)].map(
            (link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={
                    link.isPremium
                      ? 'my-1 flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-extrabold text-emerald-950 shadow-sm'
                      : `block rounded-lg px-3 py-2 text-sm font-semibold ${
                          isScrolled ? 'text-emerald-50 hover:bg-emerald-700' : 'text-slate-700 hover:bg-slate-50'
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
  )
}

export default Navbar