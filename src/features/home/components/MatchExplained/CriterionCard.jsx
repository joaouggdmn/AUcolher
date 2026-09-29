// Um critério do algoritmo lido de ponta a ponta: o que você responde, o que
// o anúncio informa e a regra exata dos pontos (vinda do matchScore.js)
function CriterionCard({ criterion, isHeaviest, isWide }) {
  const { icon: Icon, label, maxPoints, question, petFieldLabel, rule } = criterion

  return (
    <article
      className={`flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm shadow-emerald-950/5 ${
        isHeaviest ? 'ring-2 ring-amber-400' : 'ring-1 ring-slate-200/70'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          {Icon && <Icon aria-hidden="true" size={18} />}
        </span>

        <div className="min-w-0">
          <h3 className="text-lg font-extrabold leading-snug tracking-tight text-emerald-950">{label}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-amber-800">
              {maxPoints} pts
            </span>
            {isHeaviest && (
              <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-emerald-950">
                O que mais pesa
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className={`mt-5 grid gap-3 ${isWide ? 'lg:grid-cols-2 lg:gap-6' : ''}`}>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Você responde</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug text-emerald-950">{question}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">No anúncio do pet</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug text-emerald-950">{petFieldLabel}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <p className="rounded-2xl bg-stone-50 p-3.5 text-sm leading-relaxed text-slate-600">{rule}</p>
      </div>
    </article>
  )
}

export default CriterionCard
