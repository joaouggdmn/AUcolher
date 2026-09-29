// Idêntico ao quadrado de score do MatchReasonsModal, para quem vê a home
// reconhecer o mesmo número depois dentro do AUmatch
function ScoreSquare({ score, className = '' }) {
  return (
    <span
      className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-800 text-white ${className}`}
    >
      <strong className="text-xl font-black leading-none tracking-tight tabular-nums">{score}%</strong>
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">match</span>
    </span>
  )
}

export default ScoreSquare
