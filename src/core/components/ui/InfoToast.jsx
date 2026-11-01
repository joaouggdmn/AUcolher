import { FaCircleInfo } from 'react-icons/fa6'

function InfoToast({ message }) {
  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[110] flex justify-center px-4">
      <div className="animate-fade-slide-in flex items-center gap-3 rounded-full bg-amber-500 px-5 py-3 text-white shadow-2xl shadow-amber-900/20 ring-1 ring-amber-400">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <FaCircleInfo size={15} />
        </span>
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  )
}

export default InfoToast