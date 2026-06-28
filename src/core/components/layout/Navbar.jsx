import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/75 px-6 py-4 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-5">
        <Link className="text-xl font-black text-teal-700 no-underline" to="/">
          Aucolher
        </Link>
        <div className="flex flex-wrap justify-end gap-4 text-sm font-semibold text-slate-700 sm:text-base">
          <Link className="transition hover:text-teal-700" to="/animais">
            Animais
          </Link>
          <Link className="transition hover:text-teal-700" to="/eventos">
            Eventos
          </Link>
          <Link className="transition hover:text-teal-700" to="/campanhas">
            Campanhas
          </Link>
          <Link className="transition hover:text-teal-700" to="/login">
            Entrar
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
