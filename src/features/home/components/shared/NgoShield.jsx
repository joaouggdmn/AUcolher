import { FaShieldHalved } from 'react-icons/fa6'

const SIZES = {
  sm: { box: 'h-7 w-7', icon: 11 },
  md: { box: 'h-9 w-9', icon: 14 },
}

// Mesmo selo do AnimalCard e do PetSwipeCard: escudo dourado = ONG verificada
function NgoShield({ size = 'md', decorative = false, className = '' }) {
  const { box, icon } = SIZES[size]

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'ONG verificada'}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : 'ONG verificada'}
      className={`flex shrink-0 items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-md shadow-amber-500/30 ${box} ${className}`}
    >
      <FaShieldHalved size={icon} aria-hidden="true" />
    </span>
  )
}

export default NgoShield
