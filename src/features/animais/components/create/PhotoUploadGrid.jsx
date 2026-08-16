import { useRef } from 'react'
import { FaCamera, FaXmark } from 'react-icons/fa6'

const MAX_PHOTOS = 4

function PhotoUploadGrid({ images, onChange }) {
  const inputRef = useRef(null)

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = MAX_PHOTOS - images.length

    files.slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      // Atualização funcional: evita que arquivos lidos fora de ordem
      // (FileReader é assíncrono) sobrescrevam uns aos outros
      reader.onload = () => onChange((prev) => [...prev, reader.result])
      reader.readAsDataURL(file)
    })

    e.target.value = '' // permite re-selecionar o mesmo arquivo depois de removê-lo
  }

  const handleRemove = (index) => {
    onChange((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((image, index) => (
        <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <img src={image} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            aria-label="Remover foto"
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <FaXmark size={12} />
          </button>
          {index === 0 && (
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
              Capa
            </span>
          )}
        </div>
      ))}

      {images.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-all duration-300 hover:border-emerald-300 hover:text-emerald-600"
        >
          <FaCamera size={20} />
          <span className="text-xs font-semibold">Adicionar</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
    </div>
  )
}

export default PhotoUploadGrid