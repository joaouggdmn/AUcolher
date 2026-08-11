import QuizOptionCard from './QuizOptionCard'

function QuizQuestionCard({ question, selectedValue, onSelect }) {
  const gridCols = question.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="font-serif text-xl font-black text-emerald-950 sm:text-2xl">{question.title}</h2>
        <p className="text-sm text-slate-500">{question.subtitle}</p>
      </div>

      <div className={`grid gap-3 ${gridCols}`}>
        {question.options.map((option) => (
          <QuizOptionCard
            key={String(option.value)}
            label={option.label}
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