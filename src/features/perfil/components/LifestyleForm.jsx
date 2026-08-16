import { quizQuestions } from '../../onboarding/data/quizQuestions'
import QuizOptionCard from '../../onboarding/components/QuizOptionCard'

// Reaproveita literalmente as mesmas perguntas e o mesmo card visual do
// OnboardingQuiz — evita duas fontes de verdade para os dados que alimentam
// o algoritmo de match, seja na primeira resposta ou numa edição posterior.
function LifestyleForm({ values, onChange }) {
  return (
    <div className="flex flex-col gap-8">
      {quizQuestions.map((question) => {
        const gridCols = question.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'

        return (
          <div key={question.key} className="flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-bold text-emerald-950">{question.title}</h4>
              <p className="text-xs text-slate-500">{question.subtitle}</p>
            </div>

            <div className={`grid gap-3 ${gridCols}`}>
              {question.options.map((option) => (
                <QuizOptionCard
                  key={String(option.value)}
                  label={option.label}
                  icon={option.icon}
                  isSelected={values[question.key] === option.value}
                  onClick={() => onChange(question.key, option.value)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LifestyleForm