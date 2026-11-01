import { LuSparkles } from 'react-icons/lu'

function MatchToast({ pet }) {
  if (!pet) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[90] flex justify-center px-4">
      <div className="animate-fade-slide-in flex items-center gap-3 rounded-full bg-emerald-950 px-5 py-3 text-white shadow-2xl shadow-emerald-950/40 ring-1 ring-amber-400/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-emerald-950">
          <LuSparkles size={16} />
        </span>
        <p className="text-sm font-bold">
          Você curtiu <span className="text-amber-300">{pet.name}</span>!
        </p>
      </div>
    </div>
  )
}

export default MatchToast