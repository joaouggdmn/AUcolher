import PetPhoto from '../shared/PetPhoto'

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  lg: 'h-16 w-16 text-lg ring-4 ring-white',
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

// Foto do perfil público quando existe; sem perfil, as iniciais da ONG
function OngAvatar({ ong, size = 'sm', className = '' }) {
  const photoUrl = ong.profile?.photoUrl

  if (photoUrl) {
    return <PetPhoto src={photoUrl} width={160} className={`shrink-0 rounded-full ${SIZES[size]} ${className}`} />
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-800 font-black text-white ${SIZES[size]} ${className}`}
    >
      {initials(ong.name)}
    </span>
  )
}

export default OngAvatar
