import { useInView } from '../../../../core/hooks/useInView'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { CRITERIA_GUIDE, HEAVIEST_CRITERION_KEY, TOTAL_POINTS } from '../../data/criteriaGuide'

const SHORT_LABELS = {
  housing: 'Moradia',
  energy: 'Ritmo',
  independence: 'Tempo sozinho',
  living: 'Convivência',
  temperament: 'Temperamento',
}

// Âmbar só no critério que mais pesa; os outros alternam dois verdes que
// seguram texto branco com contraste AA
const EMERALD_SHADES = ['bg-emerald-800 text-white', 'bg-emerald-700 text-white']

const SEGMENT_COLORS = Object.fromEntries([
  [HEAVIEST_CRITERION_KEY, 'bg-amber-400 text-emerald-950'],
  ...CRITERIA_GUIDE.filter((criterion) => criterion.key !== HEAVIEST_CRITERION_KEY).map((criterion, index) => [
    criterion.key,
    EMERALD_SHADES[index % EMERALD_SHADES.length],
  ]),
])

const RULER_LABEL = `Divisão dos ${TOTAL_POINTS} pontos: ${CRITERIA_GUIDE.map(
  (criterion) => `${criterion.label}, ${criterion.maxPoints}`
).join('; ')}.`

// A régua enche uma vez quando entra na tela. Com movimento reduzido ela
// já nasce cheia
function PointsRuler() {
  const [ref, isInView] = useInView({ threshold: 0.4 })
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFilled = isInView || prefersReducedMotion

  return (
    <div ref={ref}>
      <p className="text-sm font-semibold text-slate-500">Como os {TOTAL_POINTS} pontos se dividem</p>

      <div
        role="img"
        aria-label={RULER_LABEL}
        className="mt-3 h-12 w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-emerald-900/10 sm:h-14"
      >
        <div
          className="flex h-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: isFilled ? '100%' : '0%' }}
        >
          {CRITERIA_GUIDE.map((criterion) => (
            <div
              key={criterion.key}
              style={{ flexGrow: criterion.maxPoints }}
              className={`flex min-w-0 basis-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap border-r-2 border-white px-2 last:border-r-0 ${SEGMENT_COLORS[criterion.key]}`}
            >
              <span className="text-sm font-black tabular-nums">{criterion.maxPoints}</span>
              <span className="hidden truncate text-xs font-semibold md:inline">{SHORT_LABELS[criterion.key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* No mobile os segmentos só cabem o número: a legenda repete o nome */}
      <ul aria-hidden="true" className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 md:hidden">
        {CRITERIA_GUIDE.map((criterion) => (
          <li key={criterion.key} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${SEGMENT_COLORS[criterion.key]}`} />
            <span className="font-bold tabular-nums text-emerald-950">{criterion.maxPoints}</span>
            {SHORT_LABELS[criterion.key]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PointsRuler
