import { FaShieldHalved, FaCircleUser } from 'react-icons/fa6'

// Usado pelos cards de Animais e do AUmatch — por isso vive em core/ui.
// variant="dark" existe porque o card do AUmatch tem o texto sobre uma foto.
function AuthorTag({ name, isVerified = false, variant = 'light', className = '' }) {
  if (!name) return null

  const colorClass =
    variant === 'dark'
      ? isVerified ? 'text-amber-300' : 'text-white/60'
      : isVerified ? 'text-amber-600' : 'text-slate-400'

  return (
    <p className={`flex items-center gap-1.5 text-xs font-semibold ${colorClass} ${className}`}>
      {isVerified ? <FaShieldHalved size={11} /> : <FaCircleUser size={11} />}
      {name}
    </p>
  )
}

export default AuthorTag