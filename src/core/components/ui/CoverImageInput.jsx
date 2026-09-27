import { useRef, useState } from 'react'
import { FaImage, FaRotate, FaTrashCan } from 'react-icons/fa6'
import { compressImage } from '../../utils/compressImage'

// Imagem de capa (evento, campanha). 🔴 Vai como data URL no JSON, como a
// foto de perfil: reduzida a ~1000 px para caber no limite da API
// (`maxLength`) e no localStorage do mock. Com upload próprio, o backend
// passaria a guardar só a URL pública
function CoverImageInput({ id, value, onChange, maxLength, error, emptyHint }) {
  const inputRef = useRef(null)
  const [fileError, setFileError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const openPicker = () => inputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Escolha um arquivo de imagem (JPG, PNG ou WebP).')
      return
    }

    setFileError(null)
    setIsProcessing(true)
    try {
      const dataUrl = await compressImage(file, { maxSize: 1000, quality: 0.7 })
      if (maxLength && dataUrl.length > maxLength) {
        setFileError('Mesmo reduzida, essa imagem ficou grande demais. Tente outra.')
      } else {
        onChange(dataUrl)
      }
    } catch {
      setFileError('Não foi possível ler essa imagem. Tente outra.')
    } finally {
      setIsProcessing(false)
    }
  }

  const message = fileError ?? error

  return (
    <div className="flex flex-col gap-1.5">
      {value ? (
        <div className="group relative h-48 overflow-hidden rounded-2xl sm:h-56">
          <img src={value} alt="Capa escolhida" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
            <button
              type="button"
              onClick={openPicker}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm transition-colors duration-300 hover:bg-white"
            >
              <FaRotate size={11} />
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-sm transition-colors duration-300 hover:bg-white"
            >
              <FaTrashCan size={11} />
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onClick={openPicker}
          disabled={isProcessing}
          className={`flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 text-center transition-all duration-300 disabled:cursor-wait sm:h-56 ${
            message
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/40'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
            {isProcessing ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
            ) : (
              <FaImage size={18} />
            )}
          </span>
          <span className="text-sm font-bold text-emerald-900">
            {isProcessing ? 'Preparando imagem...' : 'Escolher imagem de capa'}
          </span>
          {emptyHint && <span className="max-w-xs text-xs text-slate-400">{emptyHint}</span>}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {message && <p className="text-xs font-medium text-rose-600">{message}</p>}
    </div>
  )
}

export default CoverImageInput
