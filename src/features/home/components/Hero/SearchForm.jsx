import { FaMagnifyingGlass, FaLocationDot } from 'react-icons/fa6'

function SearchForm() {
  const handleUsarLocalizacao = () => {
    // 🔴 Aqui entra a lógica real: navigator.geolocation.getCurrentPosition(...)
    console.log('Buscando localização do usuário...')
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-2.5">
      <form
        className="flex w-full items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-900 to-emerald-950 p-2.5 pl-6
                   shadow-[0_25px_60px_-10px_rgba(217,119,6,0.45)]
                   ring-1 ring-emerald-950/50
                   transition-all duration-300 hover:shadow-[0_30px_70px_-8px_rgba(217,119,6,0.55)]"
      >
        <FaMagnifyingGlass className="shrink-0 text-emerald-200" size={20} />

        <label className="sr-only" htmlFor="home-search">
          Pesquisar animais
        </label>
        <input
          id="home-search"
          type="search"
          placeholder="Buscar por nome, cidade ou tipo..."
          className="min-w-0 flex-1 border-none bg-transparent py-3.5 text-base text-white outline-none placeholder:text-emerald-200/60"
        />

        {/* Botão de localização integrado — some no mobile, o atalho abaixo cobre essa ação */}
        <button
          type="button"
          onClick={handleUsarLocalizacao}
          title="Usar minha localização"
          className="hidden shrink-0 items-center justify-center rounded-full bg-emerald-800/70 p-3 text-emerald-100
                     transition-all duration-300 hover:bg-emerald-800 hover:text-white sm:flex"
        >
          <FaLocationDot size={18} />
        </button>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-amber-400 px-8 py-3.5 text-base font-extrabold text-emerald-950
                     shadow-lg shadow-amber-500/40
                     transition-all duration-300 hover:scale-[1.03] hover:bg-amber-300 hover:shadow-amber-400/50
                     active:scale-[0.98]"
        >
          Buscar
        </button>
      </form>

      {/* Atalho rápido — cobre a ação de localização em qualquer tamanho de tela */}
      <button
        type="button"
        onClick={handleUsarLocalizacao}
        className="flex items-center gap-1.5 self-start pl-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
      >
        <FaLocationDot size={14} />
        Encontrar animais mais próximos
      </button>
    </div>
  )
}

export default SearchForm