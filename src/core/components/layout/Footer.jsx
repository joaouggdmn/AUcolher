import { Link } from 'react-router-dom'
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaPaw,
  FaMagnifyingGlass,
  FaCalendarDays,
  FaHandHoldingDollar,
  FaBuilding,
  FaCircleQuestion,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import { LuCompass, LuLifeBuoy } from 'react-icons/lu'

const quickLinks = [
  { label: 'Buscar pets', to: '/animais', icon: FaMagnifyingGlass },
  { label: 'Como funciona o match', to: '/#match', icon: FaPaw },
  { label: 'Eventos', to: '/eventos', icon: FaCalendarDays },
  { label: 'Doações', to: '/campanhas', icon: FaHandHoldingDollar },
]

const supportLinks = [
  { label: 'Cadastrar minha ONG', to: '/cadastro-ong', icon: FaBuilding },
  { label: 'Central de ajuda', to: '/ajuda', icon: FaCircleQuestion },
  { label: 'Denunciar anúncio', to: '/denuncia', icon: FaTriangleExclamation },
]

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: FaFacebookF },
  { label: 'WhatsApp', href: 'https://wa.me/', icon: FaWhatsapp },
]

function Footer() {
  return (
    <footer className="bg-emerald-950 px-4 py-14 text-emerald-100 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* sm: 2 colunas (marca ocupa a linha toda) | lg: 4 faixas, marca ocupa 2 */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Coluna 1: Marca */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center text-2xl font-black tracking-tight">
              <span className="text-white">AU</span>
              <span className="text-amber-400">colher</span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-emerald-200/80">
              Conectamos corações e patas — cada adoção começa com um match
              feito para durar a vida toda.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:text-emerald-950"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2: Links rápidos */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <LuCompass size={16} className="text-amber-400" />
              Links rápidos
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-sm text-emerald-200/80 transition-colors duration-300 hover:text-amber-400"
                  >
                    <Icon size={13} className="text-emerald-400 transition-colors duration-300 group-hover:text-amber-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Suporte & ONGs */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <LuLifeBuoy size={16} className="text-amber-400" />
              Suporte &amp; ONGs
            </h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-sm text-emerald-200/80 transition-colors duration-300 hover:text-amber-400"
                  >
                    <Icon size={13} className="text-emerald-400 transition-colors duration-300 group-hover:text-amber-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Linha inferior — separador fino + copyright */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-emerald-800/60 pt-6 text-center text-xs text-emerald-300/70 sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 AUcolher. Todos os direitos reservados.</p>
          
        </div>
      </div>
    </footer>
  )
}

export default Footer