import { formatCurrency } from '../utils/currency'

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

// theme="dark" é usado no Hero SOS (fundo escuro); "light" (padrão) nos cards
function DonationProgress({ raised, goal, size = 'md', theme = 'light' }) {
  const percentage = Math.min(100, Math.round((raised / goal) * 100))
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full overflow-hidden rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'} ${HEIGHTS[size]}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-emerald-800'}`}>
          {formatCurrency(raised)} arrecadados
        </span>
        <span className={isDark ? 'text-emerald-100/60' : 'text-slate-400'}>
          de {formatCurrency(goal)} · {percentage}%
        </span>
      </div>
    </div>
  )
}

export default DonationProgress