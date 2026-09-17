import { Link } from 'react-router-dom'
import { FaLocationDot, FaCircleCheck, FaXmark, FaUser } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { computeMatchScore } from '../../aumatch/utils/matchScore'

function ReceivedRequestCard({ request, onAccept, onReject, isProcessing }) {
  const { animal, adopter } = request

  // Chamada em tempo de execução, na própria renderização — mesma função
  // pura usada em sortPetsByMatchScore (AumatchPage). Sem estado extra,
  // sem persistência, sem tocar no banco: o resultado é sempre
  // recalculado a partir de animal + adopter contidos no pedido.
  const matchScore = computeMatchScore(adopter, animal)

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/5">
      <Link
        to={`/animais/${animal.id}`}
        className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-3 transition-colors duration-300 hover:bg-emerald-50"
      >
        <img src={animal.photoUrl} alt={animal.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Interesse em</p>
          <p className="truncate text-sm font-bold text-emerald-950">{animal.name}</p>
        </div>

        <span
          title="Compatibilidade calculada pelo AUmatch"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm"
        >
          <LuSparkles size={12} className="text-amber-300" />
          {matchScore}% Match
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <img
            src={adopter.photoUrl}
            alt={adopter.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow-md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base font-bold text-emerald-950">{adopter.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <FaLocationDot size={11} className="text-emerald-600" />
              {adopter.city}, {adopter.state}
            </p>
          </div>

          {/* Completude de PERFIL do adotante — métrica diferente do match
              acima. Ícone/cor propositalmente distintos para nunca mais
              serem confundidos visualmente (essa troca foi a causa
              original do bug). */}
          <span
            title="Completude do perfil do adotante"
            className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"
          >
            <FaUser size={10} />
            {adopter.profileCompletion}%
          </span>
        </div>

        <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-600">
          {adopter.lifestyleSummary}
        </p>

        <div className="mt-auto flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onReject(request.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
          >
            <FaXmark size={13} />
            Recusar
          </button>
          <button
            type="button"
            onClick={() => onAccept(request.id)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-900/30 disabled:pointer-events-none disabled:opacity-40"
          >
            <FaCircleCheck size={13} />
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceivedRequestCard