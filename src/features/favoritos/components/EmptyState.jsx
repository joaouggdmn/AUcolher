import { Link } from 'react-router-dom'
import { FaPaw, FaMagnifyingGlass } from 'react-icons/fa6'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-400">
        <FaPaw size={26} />
      </span>

      <div>
        <h3 className="flex items-center justify-center gap-2 text-xl font-extrabold tracking-tight text-emerald-950">
          Sua lista de favoritos está vazia
          <FaPaw size={16} className="text-rose-400" />
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Toque no coração dos pets que te conquistarem — eles ficam guardados aqui para você decidir com calma.
        </p>
      </div>

      <Link
        to="/animais"
        className="mt-2 flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
      >
        <FaMagnifyingGlass size={13} />
        Explorar Animais
      </Link>
    </div>
  )
}

export default EmptyState
