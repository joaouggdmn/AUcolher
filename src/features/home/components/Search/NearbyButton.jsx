import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLocationCrosshairs, FaTriangleExclamation } from 'react-icons/fa6'
import { useGeolocation } from '../../../../core/hooks/useGeolocation'

const VARIANTS = {
  link: 'min-h-11 rounded-full text-sm font-semibold text-emerald-700 hover:text-emerald-900',
  pill: 'h-12 rounded-full border border-emerald-200 bg-white px-6 text-sm font-bold text-emerald-800 hover:border-emerald-700 hover:bg-emerald-50',
}

const SPINNER = {
  link: 'h-3.5 w-3.5 border-emerald-300 border-t-emerald-700',
  pill: 'h-4 w-4 border-emerald-200 border-t-emerald-700',
}

// Assim que as coordenadas chegam, navega direto para a listagem ordenada
// por proximidade — o mesmo fluxo que a home sempre teve
function NearbyButton({ variant = 'link', className = '' }) {
  const navigate = useNavigate()
  const { coords, isLocating, error, requestLocation } = useGeolocation()

  useEffect(() => {
    if (!coords) return
    navigate(`/animais?lat=${coords.latitude.toFixed(6)}&lng=${coords.longitude.toFixed(6)}`)
  }, [coords, navigate])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={requestLocation}
        disabled={isLocating}
        aria-busy={isLocating}
        className={`inline-flex w-fit items-center gap-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${VARIANTS[variant]}`}
      >
        {isLocating ? (
          <span aria-hidden="true" className={`animate-spin rounded-full border-2 ${SPINNER[variant]}`} />
        ) : (
          <FaLocationCrosshairs aria-hidden="true" size={variant === 'pill' ? 15 : 14} />
        )}
        {isLocating ? 'Localizando...' : 'Encontrar animais mais próximos'}
      </button>

      {error && (
        <p role="alert" className="flex max-w-md items-start gap-1.5 text-xs font-medium text-rose-600">
          <FaTriangleExclamation aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default NearbyButton
