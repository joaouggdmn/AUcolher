import { CRITERION_ICONS } from '../../data/criteriaGuide'
import { toneFor } from '../../utils/matchTone'

// Linhas do "Por que deu match?" no mesmo desenho do MatchReasonsModal.
// `criteria` vem de explainMatchScore(profile, pet).criteria.
// Só rótulo, pontos e barra: a frase de cada critério ficou para o modal do
// AUmatch — na home ela repetia o que a barra já mostra.
// - compact: tipografia menor (recibo do hero)
// - bars: um pouco maior e mais espaçado (card do simulador)
function MatchBreakdown({ criteria, variant = 'bars', tone = 'light' }) {
  const isCompact = variant === 'compact'
  const isDark = tone === 'dark'

  return (
    <ul className={`flex flex-col ${isCompact ? 'gap-2.5' : 'gap-3.5'}`}>
      {criteria.map((criterion) => {
        const ratio = criterion.maxPoints > 0 ? criterion.points / criterion.maxPoints : 0
        const colors = toneFor(ratio, tone)
        const Icon = CRITERION_ICONS[criterion.key]

        return (
          <li key={criterion.key} className="flex gap-3">
            <span aria-hidden="true" className={`mt-0.5 shrink-0 ${colors.icon}`}>
              {Icon && <Icon size={isCompact ? 13 : 16} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`font-bold ${isCompact ? 'text-xs' : 'text-sm'} ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {criterion.label}
                </p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${colors.badge}`}>
                  {criterion.points}/{criterion.maxPoints} pts
                </span>
              </div>

              <div
                className={`mt-1.5 w-full overflow-hidden rounded-full ${isCompact ? 'h-1.5' : 'h-2'} ${
                  isDark ? 'bg-white/10' : 'bg-slate-100'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${colors.bar}`}
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default MatchBreakdown
