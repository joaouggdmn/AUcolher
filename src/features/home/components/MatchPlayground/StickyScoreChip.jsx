import { Link } from 'react-router-dom'
import { FaArrowDown } from 'react-icons/fa6'
import PetPhoto from '../shared/PetPhoto'

// Só abaixo do lg: enquanto a pessoa mexe nas respostas, o resultado (que
// fica depois do painel) continua à vista num chip preso ao pé da tela.
// Precisa ser o último filho da coluna do painel — o sticky só anda dentro
// do próprio pai
function StickyScoreChip({ pet }) {
  return (
    <div className="pointer-events-none sticky bottom-4 z-20 mt-6 flex justify-center lg:hidden">
      <Link
        to="#sim-result"
        className="pointer-events-auto flex max-w-full items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-bold text-emerald-950 shadow-xl shadow-black/30 ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
      >
        <PetPhoto src={pet.photoUrl} width={96} className="h-8 w-8 shrink-0 rounded-full" />
        <span className="truncate">
          Melhor match: {pet.name} · <span className="tabular-nums text-amber-700">{pet.matchScore}%</span>
        </span>
        <FaArrowDown aria-hidden="true" size={12} className="shrink-0 text-emerald-700" />
        <span className="sr-only">(ver o resultado)</span>
      </Link>
    </div>
  )
}

export default StickyScoreChip
