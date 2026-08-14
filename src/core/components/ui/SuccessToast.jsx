import { FaCircleCheck } from 'react-icons/fa6'

function SuccessToast({ message }) {
  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[110] flex justify-center px-4">
      <div className="animate-fade-slide-in flex items-center gap-3 rounded-full bg-emerald-800 px-5 py-3 text-white shadow-2xl shadow-emerald-950/30 ring-1 ring-emerald-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-emerald-950">
          <FaCircleCheck size={15} />
        </span>
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  )
}

export default SuccessToast