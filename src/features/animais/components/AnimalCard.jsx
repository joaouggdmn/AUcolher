import { Link } from 'react-router-dom'
import { FaShieldHalved, FaHeart, FaVenus, FaMars, FaLocationDot, FaArrowRight } from 'react-icons/fa6'

function AnimalCard({ animal }) {
  const isFemale = animal.sex === 'F'

  const handleFavoritar = (e) => {
    e.preventDefault() // evita qualquer navegação acidental
    // 🔴 Aqui entra a chamada real: favoritarAnimal(animal.id)
    console.log('Favoritado:', animal.name)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10">

      {/* Foto — Link isolado aqui dentro, nunca aninhado com o botão de favoritar */}
      <div className="relative h-56 w-full overflow-hidden">
        <Link to={`/animais/${animal.id}`}>
          <img
            src={animal.photoUrl}
            alt={`Foto de ${animal.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Selo ONG — só renderiza se o anunciante for uma ONG */}
        {animal.anunciante === 'ONG' && (
          <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-md shadow-amber-500/30">
            <FaShieldHalved size={12} />
            ONG Verificada
          </span>
        )}

        {/* Botão de favoritar — irmão do Link, não filho, evita nesting inválido */}
        <button
          type="button"
          onClick={handleFavoritar}
          aria-label={`Favoritar ${animal.name}`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-400 backdrop-blur-sm transition-colors duration-300 hover:text-rose-500"
        >
          <FaHeart size={15} />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Informações */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-emerald-950">{animal.name}</h3>
            <p className="text-sm text-slate-500">
              {animal.breed} · {animal.ageLabel}
            </p>
          </div>

          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isFemale ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'
            }`}
            title={isFemale ? 'Fêmea' : 'Macho'}
          >
            {isFemale ? <FaVenus size={13} /> : <FaMars size={13} />}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <FaLocationDot size={13} className="text-emerald-600" />
          {animal.city}, {animal.state}
        </div>

        <Link
          to={`/animais/${animal.id}`}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-bold text-emerald-800 transition-all duration-300 group-hover:bg-emerald-800 group-hover:text-white"
        >
          Conhecer
          <FaArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}

export default AnimalCard