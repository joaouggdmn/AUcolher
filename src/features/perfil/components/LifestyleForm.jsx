import { FaHouseUser, FaPaw } from 'react-icons/fa6'
import { quizQuestions } from '../../onboarding/data/quizQuestions'
import QuizOptionCard from '../../onboarding/components/QuizOptionCard'

const SECTIONS = [
  {
    key: 'estiloDeVida',
    title: 'Seu Estilo de Vida & Ambiente',
    description: 'Como é o seu dia a dia — isso define o que o pet vai precisar de você.',
    icon: FaHouseUser,
  },
  {
    key: 'preferenciasPet',
    title: 'Suas Preferências para o Pet Ideal',
    description: 'O tipo de companheiro que você imagina para a sua rotina.',
    icon: FaPaw,
  },
]

// Reaproveita literalmente as mesmas perguntas e o mesmo card visual do
// OnboardingQuiz — evita duas fontes de verdade para os dados que
// alimentam o algoritmo de match, seja na primeira resposta (modal) ou
// numa edição posterior (esta tela). Agora agrupadas visualmente por
// `question.section`, refletindo a separação lógica entre "quem é o
// adotante" e "o que ele busca no pet".
function LifestyleForm({ values, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      {SECTIONS.map((section) => {
        const questions = quizQuestions.filter((q) => q.section === section.key)
        const SectionIcon = section.icon

        return (
          <div key={section.key} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                <SectionIcon size={15} />
              </span>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-emerald-950">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {questions.map((question) => {
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
                          description={option.description}
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
          </div>
        )
      })}
    </div>
  )
}

export default LifestyleForm