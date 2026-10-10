import { useState } from 'react'

// Foto redonda de uma pessoa. Sem foto — ou se o link não carregar — mostra
// a inicial do nome em vez do ícone de imagem quebrada
function Avatar({ name, photoUrl, className = '' }) {
  const [failedUrl, setFailedUrl] = useState(null)
  const showPhoto = photoUrl && failedUrl !== photoUrl

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 font-black text-white ${className}`}
    >
      {showPhoto ? (
        <img src={photoUrl} alt={name} onError={() => setFailedUrl(photoUrl)} className="h-full w-full object-cover" />
      ) : (
        name?.charAt(0).toUpperCase() ?? '?'
      )}
    </span>
  )
}

export default Avatar
