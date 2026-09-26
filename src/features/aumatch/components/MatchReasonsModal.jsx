import { useEffect, useMemo } from 'react'
import { FaXmark, FaHouseChimney, FaBolt, FaClock, FaChildren, FaHeart, FaArrowRotateRight } from 'react-icons/fa6'
import { LuLightbulb } from 'react-icons/lu'
import { useAuth } from '../../../core/context/AuthContext'
import { explainMatchScore } from '../utils/matchScore'

const CRITERION_ICONS = {
  housing: FaHouseChimney,
  energy: FaBolt,
  independence: FaClock,
  living: FaChildren,
  temperament: FaHeart,
}

// Verde para o critério cravado, âmbar para o parcial, cinza para o que não
// somou — a cor é redundante com o texto de pontos, nunca a única pista
function toneFor(ratio) {
  if (ratio >= 1) return { bar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' }
  if (ratio > 0) return { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', icon: 'text-amber-500' }
  return { bar: 'bg-slate-200', badge: 'bg-slate-100 text-slate-500', icon: 'text-slate-400' }
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
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-reasons-title"
        className="relative z-10 max-h-[85vh] w-full max-w-md animate-fade-slide-in overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex items-center gap-4 pr-8">
          <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-800 text-white">
            <strong className="text-xl font-black leading-none tracking-tight">{score}%</strong>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">match</span>
          </span>

          <div>
            <h2 id="match-reasons-title" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-emerald-950">
              <LuLightbulb size={16} className="text-amber-500" />
              Por que deu match?
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
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
                    <h3 className="text-sm font-bold text-emerald-950">{criterion.label}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.badge}`}>
                      {criterion.points}/{criterion.maxPoints} pts
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${tone.bar}`}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">{criterion.detail}</p>
                </div>
              </li>
            )
          })}
        </ul>

        {hasPendingAnswers && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800">
              Alguns critérios ainda não têm resposta sua. Complete o quiz para o percentual ficar mais preciso.
            </p>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
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
