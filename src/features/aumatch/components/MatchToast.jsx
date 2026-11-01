import { LuSparkles } from 'react-icons/lu'

function MatchToast({ pet }) {
  if (!pet) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[90] flex justify-center px-4">
      <div className="animate-fade-slide-in flex items-center gap-3 rounded-control bg-brand-950 px-5 py-3 text-white shadow-2xl ring-1 ring-accent-400/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-400 text-brand-950">
          <LuSparkles size={16} />
        </span>
        <p className="text-sm font-bold">
          Você curtiu <span className="text-accent-300">{pet.name}</span>!
        </p>
      </div>
    </div>
  )
}

export default MatchToast