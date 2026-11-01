import { useState } from 'react'
import { FaShieldHalved } from 'react-icons/fa6'

function PhotoGallery({ images, animalName, isOng }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative overflow-hidden rounded-3xl shadow-xl shadow-emerald-950/10 ${
          isOng ? 'ring-2 ring-amber-400' : 'ring-1 ring-slate-100'
        }`}
      >
        <img
          src={images[activeIndex]}
          alt={`Foto de ${animalName}`}
          className="h-80 w-full object-cover transition-opacity duration-300 sm:h-96 lg:h-[440px]"
        />

        {isOng && (
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-md shadow-amber-500/30">
            <FaShieldHalved size={12} />
            ONG Verificada
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${animalName}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl transition-all duration-300 sm:h-20 sm:w-20 ${
                index === activeIndex
                  ? 'ring-2 ring-amber-400 ring-offset-2'
                  : 'opacity-50 ring-1 ring-slate-200 hover:opacity-100'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoGallery