import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaInstagram,
  FaFacebookF,
  FaPaw,
  FaMagnifyingGlass,
  FaCalendarDays,
  FaHandHoldingDollar,
  FaBuilding,
  FaCircleQuestion,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import { LuCompass, LuLifeBuoy } from 'react-icons/lu'
import HowToReportDialog from '../../../features/denuncias/components/HowToReportDialog'
import Logo from '../ui/Logo'

const quickLinks = [
  { label: 'Buscar pets', to: '/animais', icon: FaMagnifyingGlass },
  { label: 'Como funciona o match', to: '/#match', icon: FaPaw },
  { label: 'Eventos', to: '/eventos', icon: FaCalendarDays },
  { label: 'Doações', to: '/campanhas', icon: FaHandHoldingDollar },
]

const supportLinks = [
  { label: 'Cadastrar minha ONG', to: '/cadastro-ong', icon: FaBuilding },
  { label: 'Central de ajuda', to: '/ajuda', icon: FaCircleQuestion },
]

const LINK_CLASSES =
  'group flex items-center gap-2 text-sm text-brand-200/80 transition-colors duration-300 hover:text-accent-400'
const LINK_ICON_CLASSES = 'text-brand-400 transition-colors duration-300 group-hover:text-accent-400'

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: FaFacebookF },
]

function Footer() {
  const [isReportHelpOpen, setIsReportHelpOpen] = useState(false)

  return (
    <footer className="bg-brand-950 px-4 py-14 text-brand-100 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* sm: 2 colunas (marca ocupa a linha toda) | lg: 4 faixas, marca ocupa 2 */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Coluna 1: Marca */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-2">
            <Logo tone="light" />

            <p className="max-w-xs text-sm leading-relaxed text-brand-200/80">
              Conectamos corações e patas. Cada adoção começa com um match
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-brand-100 transition-colors duration-200 hover:bg-accent-400 hover:text-brand-950"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2: Links rápidos */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <LuCompass size={16} className="text-accent-400" />
              Links rápidos
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-sm text-brand-200/80 transition-colors duration-300 hover:text-accent-400"
                  >
                    <Icon size={13} className="text-brand-400 transition-colors duration-300 group-hover:text-accent-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Suporte & ONGs */}
          <div className="flex flex-col gap-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <LuLifeBuoy size={16} className="text-accent-400" />
              Suporte &amp; ONGs
            </h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link to={to} className={LINK_CLASSES}>
                    <Icon size={13} className={LINK_ICON_CLASSES} />
                    {label}
                  </Link>
                </li>
              ))}
              {/* A denúncia é feita no próprio anúncio ou perfil: aqui só explica como */}
              <li>
                <button type="button" onClick={() => setIsReportHelpOpen(true)} className={LINK_CLASSES}>
                  <FaTriangleExclamation size={13} className={LINK_ICON_CLASSES} />
                  Como denunciar
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha inferior — separador fino + copyright */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-brand-700/60 pt-6 text-center text-xs text-brand-200/70 sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 AUcolher. Todos os direitos reservados.</p>
          
        </div>
      </div>

      {isReportHelpOpen && <HowToReportDialog onClose={() => setIsReportHelpOpen(false)} />}
    </footer>
  )
}

export default Footer