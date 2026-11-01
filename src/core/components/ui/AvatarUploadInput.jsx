import { useRef } from 'react'
import { FaCamera, FaUser } from 'react-icons/fa6'
import { compressImage } from '../../utils/compressImage'

const SIZE_CLASSES = { md: 'h-20 w-20', lg: 'h-28 w-28' }

function AvatarUploadInput({ value, onChange, fallbackInitial, size = 'lg' }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    // 🔴 Vai como data URL no photoUrl do cadastro (coluna photo_url) e volta
    // em toda resposta de login — por isso reduzido a um avatar leve
    // (~400px, dezenas de KB). Com upload próprio (S3, Cloudinary etc.), o
    // backend passaria a guardar só a URL pública
    compressImage(file, { maxSize: 400, quality: 0.8 })
      .then(onChange)
      .catch(() => {}) // arquivo que o navegador não consegue decodificar: ignora
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative ${SIZE_CLASSES[size]} shrink-0 overflow-hidden rounded-full bg-brand-50 ring-4 ring-white transition-all duration-300 hover:ring-accent-200`}
      >
        {value ? (
          <img src={value} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-black text-brand-600">
            {fallbackInitial || <FaUser size={22} />}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-brand-950/0 text-white opacity-0 transition-all duration-300 group-hover:bg-brand-950/50 group-hover:opacity-100">
          <FaCamera size={18} />
        </span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-brand-600 underline decoration-brand-200 decoration-2 underline-offset-4 transition-colors hover:text-brand-800"
      >
        {value ? 'Trocar foto' : 'Adicionar foto (opcional)'}
      </button>
    </div>
  )
}

export default AvatarUploadInput