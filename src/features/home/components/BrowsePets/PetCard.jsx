import { Link } from 'react-router-dom'
import { FaArrowRight, FaLocationDot, FaMars, FaShieldHalved, FaVenus } from 'react-icons/fa6'
import FavoriteButton from '../../../../core/components/ui/FavoriteButton'
import NgoShield from '../shared/NgoShield'
import PetPhoto from '../shared/PetPhoto'

// Mesmo desenho do AnimalCard da listagem, com três diferenças pensadas para
// a vitrine: foto no tamanho do card (não a de 1200px), fallback de marca se
// a imagem falhar e altura cheia, para a grade fechar alinhada.
// O card inteiro é clicável pelo link "Conhecer" (after:inset-0), e o
// coração fica por cima dele (z-10)
function PetCard({ pet }) {
  const isFemale = pet.sex === 'F'
  const isNgo = pet.listingType === 'NGO'
  const SexIcon = isFemale ? FaVenus : FaMars

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-emerald-950/15 ${
        isNgo ? 'shadow-lg shadow-amber-500/10 ring-2 ring-amber-400' : 'shadow-sm ring-1 ring-slate-200/70'
      }`}
    >
      <div className="relative h-56 shrink-0 overflow-hidden bg-emerald-900">
        <PetPhoto
          src={pet.photoUrl}
          alt={`Foto de ${pet.name}`}
          width={600}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent"
        />
        {isNgo && <NgoShield className="absolute left-3 top-3" />}
        <FavoriteButton animalId={pet.id} animalName={pet.name} className="absolute right-3 top-3 z-10 h-9 w-9" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold tracking-tight text-emerald-950">{pet.name}</h3>
            <p className="truncate text-sm text-slate-500">
              {pet.breed} · {pet.ageLabel}
            </p>
          </div>
          <span
            role="img"
            aria-label={isFemale ? 'Fêmea' : 'Macho'}
            title={isFemale ? 'Fêmea' : 'Macho'}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isFemale ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'
            }`}
          >
            <SexIcon aria-hidden="true" size={13} />
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <FaLocationDot aria-hidden="true" size={13} className="shrink-0 text-emerald-600" />
          {pet.city}, {pet.state}
        </p>

        {isNgo && pet.organizationName && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <FaShieldHalved aria-hidden="true" size={11} className="shrink-0" />
            {pet.organizationName}
          </p>
        )}

        <Link
          to={`/animais/${pet.id}`}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-bold text-emerald-800 transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:bg-emerald-800 group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          Conhecer<span className="sr-only"> {pet.name}</span>
          <FaArrowRight
            aria-hidden="true"
            size={12}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  )
}

export default PetCard
