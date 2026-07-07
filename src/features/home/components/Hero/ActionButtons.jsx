import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays } from 'react-icons/fa6'

function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        to="/animais"
        className="group flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-emerald-900/30"
      >
        Ver animais disponíveis
        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>

      <Link
        to="/eventos"
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-emerald-900 transition-all duration-300 hover:border-emerald-700 hover:bg-emerald-50"
      >
        Conhecer eventos
        <FaCalendarDays />
      </Link>
    </div>
  )
}

export default ActionButtons