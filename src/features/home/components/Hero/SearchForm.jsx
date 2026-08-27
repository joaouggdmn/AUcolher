import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMagnifyingGlass, FaLocationDot, FaTriangleExclamation } from 'react-icons/fa6'
import { useGeolocation } from '../../../../core/hooks/useGeolocation'

function SearchForm() {
  const navigate = useNavigate()
  const { coords, isLocating, error, requestLocation } = useGeolocation()
  const [searchTerm, setSearchTerm] = useState('')

  // Assim que as coordenadas chegam com sucesso, navega direto para a
  // listagem — o resultado real (lista ordenada por proximidade) já
  // funciona como a prova visual, então o toast de debug não é mais necessário
  useEffect(() => {
    if (!coords) return
    navigate(`/animais?lat=${coords.latitude.toFixed(6)}&lng=${coords.longitude.toFixed(6)}`)
  }, [coords, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchTerm.trim()
    navigate(trimmed ? `/animais?search=${encodeURIComponent(trimmed)}` : '/animais')
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-2.5">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-2 rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-950 p-2.5
                   shadow-[0_25px_60px_-10px_rgba(217,119,6,0.45)] ring-1 ring-emerald-950/50
                   transition-all duration-300 hover:shadow-[0_30px_70px_-8px_rgba(217,119,6,0.55)]
                   sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-full sm:pl-6"
      >
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 sm:rounded-none sm:bg-transparent sm:p-0">
          <FaMagnifyingGlass className="shrink-0 text-emerald-200" size={20} />

          <label className="sr-only" htmlFor="home-search">
            Pesquisar animais
          </label>
          <input
            id="home-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, cidade ou tipo..."
            className="min-w-0 flex-1 border-none bg-transparent text-base text-white outline-none placeholder:text-emerald-200/60"
          />
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={isLocating}
          title="Usar minha localização"
          className="hidden shrink-0 items-center justify-center rounded-full bg-emerald-800/70 p-3 text-emerald-100
                     transition-all duration-300 hover:bg-emerald-800 hover:text-white disabled:cursor-wait disabled:opacity-60 sm:flex"
        >
          {isLocating ? (
            <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-emerald-100/40 border-t-emerald-100" />
          ) : (
            <FaLocationDot size={18} />
          )}
        </button>

        <button
          type="submit"
          className="w-full shrink-0 rounded-full bg-amber-400 px-8 py-3.5 text-base font-extrabold text-emerald-950
                     shadow-lg shadow-amber-500/40 transition-all duration-300
                     hover:scale-[1.03] hover:bg-amber-300 hover:shadow-amber-400/50 active:scale-[0.98] sm:w-auto"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-col gap-1 pl-2">
        <button
          type="button"
          onClick={requestLocation}
          disabled={isLocating}
          className="flex w-fit items-center gap-1.5 self-start text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900 disabled:cursor-wait disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
              Localizando...
            </>
          ) : (
            <>
              <FaLocationDot size={14} />
              Encontrar animais mais próximos
            </>
          )}
        </button>

        {error && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <FaTriangleExclamation size={12} />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default SearchForm