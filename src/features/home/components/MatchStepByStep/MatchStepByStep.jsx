import { LuSparkles } from 'react-icons/lu'
import StepCard from './StepCard'
import { steps } from './stepsData'
import RevealOnScroll from '../../../../core/components/ui/RevealOnScroll'

function MatchStepByStep() {
  return (
    <section className="relative bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <LuSparkles size={16} />
            Como funciona
          </span>
          <h2 className="mt-5 font-serif text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl lg:text-4xl">
            Três passos até o seu match perfeito
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Simples para você, inteligente por trás dos panos.
          </p>
        </RevealOnScroll>

        <div className="relative grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="pointer-events-none absolute left-1/2 top-8 bottom-8 block w-0 -translate-x-1/2 border-l-2 border-dashed border-emerald-200 lg:hidden" />
          <div className="pointer-events-none absolute left-[15%] right-[15%] top-10 hidden border-t-2 border-dashed border-emerald-200 lg:block" />

          {steps.map((step, index) => (
            <RevealOnScroll key={step.number} delay={index * 150}>
              <StepCard {...step} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MatchStepByStep