import { formatCurrency } from '../../../core/utils/currency'

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

// theme="dark" é usado no Hero SOS (fundo escuro); "light" (padrão) nos cards.
// Meta 0 não divide por zero; acima de 100% a barra fica cheia e o texto
// mostra o percentual real (ex.: 106%). showAmounts=false quando a tela já
// mostra os valores em destaque (detalhe da campanha)
function DonationProgress({ raised, goal, size = 'md', theme = 'light', showAmounts = true }) {
  const realPercentage = goal > 0 ? Math.round((raised / goal) * 100) : 0
  const barWidth = Math.min(100, realPercentage)
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full overflow-hidden rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'} ${HEIGHTS[size]}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-3 text-xs sm:text-sm">
        {showAmounts && (
          <span className={isDark ? 'text-emerald-100/60' : 'text-slate-400'}>
            <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-emerald-800'}`}>{formatCurrency(raised)}</span>
            {' '}de {formatCurrency(goal)}
          </span>
        )}
        <span className={`ml-auto shrink-0 font-bold ${isDark ? 'text-amber-300' : 'text-emerald-800'}`}>
          {realPercentage}%{!showAmounts && ' da meta'}
        </span>
      </div>
    </div>
  )
}

export default DonationProgress
