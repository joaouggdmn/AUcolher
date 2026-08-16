import { useRef } from 'react'
import { FaCamera, FaUser } from 'react-icons/fa6'

const SIZE_CLASSES = { md: 'h-20 w-20', lg: 'h-28 w-28' }

function AvatarUploadInput({ value, onChange, fallbackInitial, size = 'lg' }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    // 🔴 Mock: converte para base64 e mantém em memória/localStorage.
    // Em produção, isso faria upload para object storage (S3, Cloudinary etc.)
    // e o backend retornaria uma URL pública para salvar no perfil.
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative ${SIZE_CLASSES[size]} shrink-0 overflow-hidden rounded-full bg-emerald-50 shadow-lg shadow-emerald-950/10 ring-4 ring-white transition-all duration-300 hover:ring-amber-200`}
      >
        {value ? (
          <img src={value} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-black text-emerald-700">
            {fallbackInitial || <FaUser size={22} />}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 text-white opacity-0 transition-all duration-300 group-hover:bg-emerald-950/50 group-hover:opacity-100">
          <FaCamera size={18} />
        </span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-emerald-700 underline decoration-emerald-300 decoration-2 underline-offset-4 transition-colors hover:text-emerald-900"
      >
        {value ? 'Trocar foto' : 'Adicionar foto (opcional)'}
      </button>
    </div>
  )
}

export default AvatarUploadInput