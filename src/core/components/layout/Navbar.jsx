import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Animais', to: '/animais' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Campanhas', to: '/campanhas' },
  { label: 'Sobre', to: '/sobre' },
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    handleScroll() // garante o estado certo se a página carregar já rolada
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center text-2xl font-black tracking-tight">
          <span
            className={`transition-colors duration-300 ${
              isScrolled ? 'text-white' : 'text-emerald-900'
            }`}
          >
            AU
          </span>
          <span className="text-amber-500">colher</span>
        </Link>

        {/* Links (desktop) */}
        <ul className="hidden items-center gap-8 text-sm font-semibold md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`transition-colors duration-300 ${
                  isScrolled
                    ? 'text-emerald-50 hover:text-amber-300'
                    : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Ações */}
        <div className="flex items-center gap-3">
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

          {/* Hambúrguer (mobile) */}
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`ml-1 md:hidden ${isScrolled ? 'text-white' : 'text-emerald-900'}`}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile expandido */}
      {isMenuOpen && (
        <ul
          className={`flex flex-col gap-1 px-6 pb-4 md:hidden ${
            isScrolled ? 'bg-emerald-800' : 'bg-white'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                  isScrolled
                    ? 'text-emerald-50 hover:bg-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

export default Navbar