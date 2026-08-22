import { useNavigate } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'

function CreateEntityCta({ icon: Icon, title, description, buttonLabel, targetPath, requireOng = false, onNeedsLogin, onNeedsOng }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (!isAuthenticated) {
      onNeedsLogin?.()
      return
    }
    if (requireOng && user?.userType !== 'ONG') {
      onNeedsOng?.()
      return
    }
    navigate(targetPath)
  }

  return (
    <section className="mt-14 flex flex-col items-center gap-5 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-emerald-50 px-6 py-12 text-center sm:px-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-800 text-white">
        <Icon size={22} />
      </span>

      <div>
        <h3 className="font-serif text-2xl font-black text-emerald-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-slate-600">{description}</p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="group flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3 font-bold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
      >
        {buttonLabel}
        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </section>
  )
}

export default CreateEntityCta