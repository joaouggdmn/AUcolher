import { useState } from 'react'
import { FaStar } from 'react-icons/fa6'

const STARS = [1, 2, 3, 4, 5]

// Sem onChange é só exibição; com onChange vira um seletor de nota
function RatingStars({ value = 0, onChange, size = 14 }) {
  const [hovered, setHovered] = useState(0)

  if (!onChange) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`${value} de 5 estrelas`}>
        {STARS.map((star) => (
          <FaStar key={star} size={size} className={star <= value ? 'text-amber-400' : 'text-slate-200'} />
        ))}
      </div>
    )
  }

  const displayed = hovered || value

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Nota de 1 a 5 estrelas"
      onMouseLeave={() => setHovered(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="rounded-lg p-1 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <FaStar size={size} className={star <= displayed ? 'text-amber-400' : 'text-slate-200'} />
        </button>
      ))}
    </div>
  )
}

export default RatingStars
