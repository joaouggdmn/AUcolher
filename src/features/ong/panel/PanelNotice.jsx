import { Link } from 'react-router-dom'
import { FaLock } from 'react-icons/fa6'

// Aviso no lugar de um formulário que não pode abrir (não é da ONG, já
// aconteceu, foi adotado, foi encerrado...)
function PanelNotice({ icon: Icon = FaLock, title, children, backTo, backLabel }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon size={16} />
      </span>
      {title && <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">{title}</h2>}
      <p className="max-w-md text-sm text-slate-500">{children}</p>
      <Link to={backTo} className="text-sm font-bold text-emerald-700 hover:underline">
        {backLabel}
      </Link>
    </div>
  )
}

export default PanelNotice
