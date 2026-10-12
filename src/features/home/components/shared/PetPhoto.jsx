import { useState } from 'react'
import { FaPaw } from 'react-icons/fa6'
import { resizePhoto } from '../../utils/homePets'
import { reportBrokenPhoto } from '../../hooks/useBrokenPhotos'

// Foto de pet com o tamanho certo para o card e um fallback de marca se a
// URL falhar — um ícone quebrado no hero é o oposto de passar confiança.
// alt vazio = imagem decorativa (cards de fundo, miniaturas repetidas)
function PetPhoto({ src, alt = '', width = 800, eager = false, className = '' }) {
  // Guarda QUAL src falhou: se o pet mudar, a nova foto é tentada de novo
  // sem precisar de effect para "resetar" o erro
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || failedSrc === src) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`flex items-center justify-center bg-emerald-800 text-emerald-400 ${className}`}
      >
        <FaPaw size={28} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={resizePhoto(src, width)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      draggable={false}
      onError={() => {
        setFailedSrc(src)
        reportBrokenPhoto(src)
      }}
      className={`object-cover ${className}`}
    />
  )
}

export default PetPhoto
