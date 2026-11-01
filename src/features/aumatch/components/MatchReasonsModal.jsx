import { useEffect, useMemo } from 'react'
import { FaXmark, FaHouseChimney, FaBolt, FaClock, FaChildren, FaHeart, FaRulerCombined, FaArrowRotateRight } from 'react-icons/fa6'
import { LuLightbulb } from 'react-icons/lu'
import { useAuth } from '../../../core/context/AuthContext'
import { explainMatchScore } from '../utils/matchScore'

const CRITERION_ICONS = {
  housing: FaHouseChimney,
  energy: FaBolt,
  independence: FaClock,
  living: FaChildren,
  temperament: FaHeart,
  size: FaRulerCombined,
}

// Verde para o critério cravado, âmbar para o parcial, cinza para o que não
// somou — a cor é redundante com o texto de pontos, nunca a única pista
function toneFor(ratio) {
  if (ratio >= 1) return { bar: 'bg-brand-600', badge: 'bg-brand-50 text-brand-600', icon: 'text-brand-600' }
  if (ratio > 0) return { bar: 'bg-accent-400', badge: 'bg-accent-50 text-accent-700', icon: 'text-accent-500' }
  return { bar: 'bg-line', badge: 'bg-sand text-ink-500', icon: 'text-ink-500' }
}

function MatchReasonsModal({ pet, onClose, onOpenQuiz }) {
  const { user } = useAuth()

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const explanation = useMemo(() => explainMatchScore(user, pet), [user, pet])

  if (!pet) return null

  const { score, criteria, hasPendingAnswers } = explanation

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-reasons-title"
        className="relative z-10 max-h-[85vh] w-full max-w-md animate-fade-slide-in scrollbar-soft overflow-y-auto rounded-modal bg-white p-6 shadow-modal sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors duration-300 hover:bg-sand hover:text-ink-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex items-center gap-4 pr-8">
          <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-card bg-brand-700 text-white">
            <strong className="text-xl font-black leading-none tracking-tight">{score}%</strong>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200">match</span>
          </span>

          <div>
            <h2 id="match-reasons-title" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-brand-950">
              <LuLightbulb size={16} className="text-accent-500" />
              Por que deu match?
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              Como {pet.name} se encaixa nas respostas do seu quiz.
            </p>
          </div>
        </div>

        <ul className="mt-6 flex flex-col gap-4">
          {criteria.map((criterion) => {
            const ratio = criterion.points / criterion.maxPoints
            const tone = toneFor(ratio)
            const Icon = CRITERION_ICONS[criterion.key]

            return (
              <li key={criterion.key} className="flex gap-3">
                <span className={`mt-0.5 shrink-0 ${tone.icon}`}>{Icon && <Icon size={16} />}</span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-brand-950">{criterion.label}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.badge}`}>
                      {criterion.points}/{criterion.maxPoints} pts
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${tone.bar}`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-ink-500">{criterion.detail}</p>
                </div>
              </li>
            )
          })}
        </ul>

        {hasPendingAnswers && (
          <div className="mt-6 flex flex-col gap-3 rounded-card bg-accent-50 p-4">
            <p className="text-xs font-medium text-accent-800">
              Alguns critérios ainda não têm resposta sua. Complete o quiz para o percentual ficar mais preciso.
            </p>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="flex items-center justify-center gap-2 rounded-control bg-brand-700 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
            >
              <FaArrowRotateRight size={13} />
              Ajustar meu perfil
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchReasonsModal
