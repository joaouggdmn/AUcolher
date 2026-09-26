import QuizOptionCard from './QuizOptionCard'

// Uma pergunta do quiz: enunciado + grade de opções. Recebe a pergunta
// inteira do OnboardingQuiz e delega cada alternativa ao QuizOptionCard
function QuizQuestionCard({ question, selectedValue, onSelect }) {
  if (!question) return null

  // Perguntas de 2 alternativas (sim/não) ficam melhor em 2 colunas fixas
  const gridCols = question.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-emerald-950">{question.title}</h2>
        {question.subtitle && <p className="mt-1 text-sm text-slate-500">{question.subtitle}</p>}
      </div>

      <div className={`grid gap-3 ${gridCols}`}>
        {question.options.map((option) => (
          <QuizOptionCard
            // Alternativas booleanas (true/false) precisam de key em string
            key={String(option.value)}
            label={option.label}
            description={option.description}
            icon={option.icon}
            isSelected={selectedValue === option.value}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </div>
    </div>
  )
}

export default QuizQuestionCard
