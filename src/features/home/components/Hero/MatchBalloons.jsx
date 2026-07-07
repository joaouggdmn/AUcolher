import { LuSparkles } from 'react-icons/lu'
import { FaChildren, FaRulerVertical, FaPaw } from 'react-icons/fa6'

function MatchBalloons({ variant = 'desktop' }) {
  if (variant === 'mobile') {
    return (
      <>
        <div className="absolute left-0 top-4 z-30 flex items-center gap-1.5 rounded-2xl bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30">
          <LuSparkles size={14} />
          Match: 98%
        </div>
        <div className="absolute bottom-6 right-0 z-30 flex items-center gap-1.5 rounded-2xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-lg shadow-emerald-950/10">
          <FaChildren size={14} />
          Ama crianças
        </div>
      </>
    )
  }

  return (
    <>
      {/* Balão principal: Match % — maior hierarquia, dourado */}
      <div className="absolute left-0 top-12 z-30 flex -rotate-3 animate-float items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 shadow-xl shadow-amber-500/40">
        <LuSparkles size={18} className="text-emerald-900" />
        <div className="leading-tight">
          <p className="text-[11px] font-semibold text-emerald-900/70">Compatibilidade</p>
          <p className="text-sm font-black text-emerald-950">Match: 98%</p>
        </div>
      </div>

      {/* Balão: comportamento */}
      <div className="absolute right-2 top-24 z-30 flex rotate-2 animate-float items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xl shadow-emerald-950/10 [animation-delay:0.8s]">
        <FaChildren size={16} className="text-emerald-700" />
        <p className="text-sm font-bold text-emerald-950">Ama crianças</p>
      </div>

      {/* Balão: porte */}
      <div className="absolute bottom-28 left-4 z-30 flex -rotate-2 animate-float items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xl shadow-emerald-950/10 [animation-delay:1.6s]">
        <FaRulerVertical size={16} className="text-emerald-700" />
        <p className="text-sm font-bold text-emerald-950">Porte médio</p>
      </div>

      {/* Selo — assinatura visual da marca */}
      <div className="absolute bottom-8 right-8 z-30 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-emerald-800 text-white shadow-xl shadow-emerald-950/30 [animation-delay:2.4s]">
        <FaPaw size={20} />
      </div>
    </>
  )
}

export default MatchBalloons