import { FaShieldHalved } from 'react-icons/fa6'
import { formatDateBr } from '../../utils/formatDate'

const SIZES = {
  sm: 'gap-1.5 rounded-full px-2.5 py-1 text-[11px]',
  md: 'gap-2 rounded-2xl px-4 py-3 text-sm',
}

// "Editado pela moderação em {data}": o admin mexeu no conteúdo de outra
// pessoa (anúncio, evento, campanha ou perfil). Só o dono e o admin veem.
// `size`: 'sm' nas linhas das listas, 'md' em cima de uma página
function ModeratedNote({ moderatedAt, size = 'sm', className = '' }) {
  if (!moderatedAt) return null

  return (
    <p className={`inline-flex w-fit items-center bg-sky-50 font-semibold text-sky-800 ${SIZES[size]} ${className}`}>
      <FaShieldHalved size={size === 'sm' ? 10 : 13} className="shrink-0" />
      Editado pela moderação em {formatDateBr(moderatedAt)}
    </p>
  )
}

export default ModeratedNote
