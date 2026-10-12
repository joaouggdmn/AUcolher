import { Link, NavLink } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { FaShieldHalved } from 'react-icons/fa6'

const FOOTER_LINK_CLASSES =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-100/80 transition-colors duration-200 hover:bg-white/5 hover:text-white'

function formatBadge(count) {
  return count > 9 ? '9+' : count
}

function IdentityAvatar({ name, photoUrl }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-base font-black text-amber-300">
      {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : name?.charAt(0).toUpperCase()}
    </span>
  )
}

// Conteúdo da barra lateral dos painéis (ONG e admin), igual no desktop
// (fixa) e no celular (gaveta). Cada painel passa quem está logado
// (`identity`), os grupos de links e os links do rodapé; `badge` de um item
// aponta para um número de `stats`. Na gaveta chegam `onClose` (mostra o X)
// e `onNavigate` (fecha ao trocar de seção)
function PanelNav({ homePath, identity, groups, stats = {}, footerLinks = [], onClose, onNavigate, closeButtonRef }) {
  return (
    <div className="flex h-full w-full flex-col bg-emerald-950 text-emerald-100">
      <div className="flex items-center justify-between px-5 pt-4">
        <Link to={homePath} onClick={onNavigate} className="text-xl font-black tracking-tight">
          <span className="text-white">AU</span>
          <span className="text-amber-400">colher</span>
        </Link>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-200 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="mx-3 mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-2.5">
        <IdentityAvatar name={identity.name} photoUrl={identity.photoUrl} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold text-white" title={identity.name}>
            <span className="truncate">{identity.name}</span>
            {identity.isVerified && (
              <FaShieldHalved size={11} className="shrink-0 text-amber-300" title="Instituição verificada" />
            )}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">{identity.caption}</p>
        </div>
      </div>

      <nav aria-label="Seções do painel" className="scrollbar-dark mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {groups.map((group, index) => (
          <div key={group.title ?? index} className={index > 0 ? 'mt-4' : ''}>
            {group.title && (
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">{group.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ to, end, label, icon: Icon, badge, badgeLabel }) => {
                const count = badge ? stats[badge] : 0
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                          isActive ? 'bg-white/10 text-white' : 'text-emerald-100/80 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={15} className={isActive ? 'text-amber-300' : 'text-emerald-300/70'} />
                          <span className="flex-1">{label}</span>
                          {count > 0 && (
                            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                              {formatBadge(count)}
                              <span className="sr-only"> {badgeLabel}</span>
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footerLinks.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-white/10 px-3 py-2">
          {footerLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={onNavigate} className={FOOTER_LINK_CLASSES}>
              <Icon size={14} className="text-emerald-300/70" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default PanelNav
