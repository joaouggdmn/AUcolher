import { LuSparkles } from 'react-icons/lu'
import StepCard from './StepCard'
import { steps } from './stepsData'

function MatchStepByStep() {
  return (
    <section className="relative bg-gradient-to-b from-stone-50 to-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <LuSparkles size={16} />
            Como funciona o match
          </span>
          <h2 className="mt-5 font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
            Três passos até o seu match perfeito
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Nosso algoritmo faz o trabalho pesado — você só precisa dizer quem é.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {/* Linha conectora — só no desktop, atravessa o centro dos círculos */}
          <div className="pointer-events-none absolute left-[15%] right-[15%] top-10 hidden border-t-2 border-dashed border-emerald-200 lg:block" />

          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default MatchStepByStep