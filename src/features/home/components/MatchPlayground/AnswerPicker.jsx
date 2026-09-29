import { FaArrowRotateLeft } from 'react-icons/fa6'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'
import { EXAMPLE_PROFILE, SIM_KEYS } from '../../data/exampleProfile'

// As perguntas reais do quiz (títulos, opções e ícones), menos o porte,
// que não entra no cálculo
const SIM_QUESTIONS = quizQuestions.filter((question) => SIM_KEYS.includes(question.key))

const STATUS = {
  example: { label: 'Exemplo', className: 'bg-white/10 text-emerald-100' },
  quiz: { label: 'Suas respostas', className: 'bg-emerald-400/15 text-emerald-200' },
  mixed: { label: 'Suas respostas + exemplo', className: 'bg-emerald-400/15 text-emerald-200' },
  dirty: { label: 'Editado · não é salvo', className: 'bg-amber-400/15 text-amber-300' },
}

const TAG = 'rounded-full px-2.5 py-0.5 text-[11px] font-bold'

// Radios nativos com o input escondido (peer): setas do teclado trocam a
// opção como em qualquer grupo de rádio. O label é relative para o input
// sr-only não ser posicionado longe dali e puxar a rolagem no foco.
// Opção com descrição (tempo fora de casa) vira um bloco de duas linhas —
// num pill redondo o texto quebrado ficava torto no mobile
function OptionPill({ name, option, checked, onSelect }) {
  const Icon = option.icon
  const hasDescription = !!option.description

  return (
    <label className="relative cursor-pointer">
      <input
        type="radio"
        name={name}
        value={String(option.value)}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        className={`inline-flex items-center gap-2 border border-white/15 bg-white/5 text-sm font-semibold text-emerald-50 transition-colors duration-200 hover:border-white/30 hover:bg-white/10 peer-checked:border-amber-400 peer-checked:bg-amber-400 peer-checked:text-emerald-950 peer-checked:hover:border-amber-300 peer-checked:hover:bg-amber-300 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-emerald-950 ${
          hasDescription ? 'rounded-2xl py-2 pl-3.5 pr-4' : 'rounded-full px-3.5 py-2'
        }`}
      >
        {Icon && <Icon aria-hidden="true" size={14} className="shrink-0" />}
        {hasDescription ? (
          <span className="flex flex-col leading-tight">
            {option.label}
            <span className="mt-0.5 text-[11px] font-medium opacity-75">{option.description}</span>
          </span>
        ) : (
          option.label
        )}
      </span>
    </label>
  )
}

function AnswerPicker({ persona, sim }) {
  const { profile, setAnswer, reset, isDirty, source, exampleKeys } = sim
  const status = isDirty ? STATUS.dirty : STATUS[source]
  const hasOwnAnswers = persona.kind === 'matched' || persona.kind === 'pending'

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-base font-extrabold text-white">Perfil de teste</h3>
          <span className={`${TAG} py-1 ${status.className}`}>{status.label}</span>
        </div>

        {isDirty && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-9 items-center gap-2 rounded-full text-sm font-bold text-amber-300 transition-colors duration-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
          >
            <FaArrowRotateLeft aria-hidden="true" size={12} />
            {hasOwnAnswers ? 'Voltar às minhas respostas' : 'Voltar ao exemplo'}
          </button>
        )}
      </div>

      <div className="mt-3">
        {SIM_QUESTIONS.map((question) => {
          // "exemplo" só enquanto a resposta ainda é a do exemplo: trocada no
          // simulador, ela passa a ser da pessoa
          const isExampleAnswer =
            persona.kind === 'pending' &&
            exampleKeys.includes(question.key) &&
            profile[question.key] === EXAMPLE_PROFILE[question.key]

          return (
            <div key={question.key} className="border-t border-white/10 py-5 first:border-t-0 last:pb-0">
              <fieldset>
                <legend className="w-full">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-sm font-bold text-white">{question.title}</span>
                    {isExampleAnswer && <span className={`${TAG} bg-amber-400/15 text-amber-300`}>exemplo</span>}
                  </span>
                </legend>

                <div className="mt-3 flex flex-wrap gap-2">
                  {question.options.map((option) => (
                    <OptionPill
                      key={String(option.value)}
                      name={`sim-${question.key}`}
                      option={option}
                      checked={profile[question.key] === option.value}
                      onSelect={() => setAnswer(question.key, option.value)}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AnswerPicker
