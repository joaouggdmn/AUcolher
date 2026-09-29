import { FaCircleCheck } from 'react-icons/fa6'
import { LuLightbulb } from 'react-icons/lu'
import MatchBreakdown from '../shared/MatchBreakdown'
import { explainMatchScore } from '../../../aumatch/utils/matchScore'
import { healthTags } from '../../utils/homePets'

// O "Por que deu match?" do card do hero já vem aberto: a conta dos pontos
// fica à vista antes de qualquer clique. O título recebe o foco quando a
// pessoa toca no "% match" do card, e o anel âmbar (focus-within) mostra
// para onde ela foi levada
function HeroReceipt({ pet, profile, titleRef, className = '' }) {
  const { criteria } = explainMatchScore(profile, pet)
  const tags = healthTags(pet)

  return (
    <div
      id="hero-receipt"
      role="group"
      aria-labelledby="hero-receipt-title"
      className={`rounded-3xl bg-white p-5 shadow-2xl shadow-emerald-950/15 ring-1 ring-emerald-900/5 transition-shadow duration-300 focus-within:ring-2 focus-within:ring-amber-300 ${className}`}
    >
      <p
        id="hero-receipt-title"
        ref={titleRef}
        tabIndex={-1}
        className="flex items-center gap-2 text-sm font-extrabold text-emerald-950 focus:outline-none"
      >
        <LuLightbulb aria-hidden="true" size={15} className="shrink-0 text-amber-500" />
        Por que deu match?
      </p>
      <p className="mt-1 text-xs text-slate-500">Os pontos de {pet.name} em cada critério.</p>

      <div className="mt-4">
        <MatchBreakdown criteria={criteria} variant="compact" />
      </div>

      {tags.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold text-slate-500">Saúde informada no anúncio</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
              >
                <FaCircleCheck aria-hidden="true" size={9} className="text-emerald-600" />
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default HeroReceipt
