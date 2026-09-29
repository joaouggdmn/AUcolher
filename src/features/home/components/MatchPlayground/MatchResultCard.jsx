import { Link } from 'react-router-dom'
import { FaArrowRight, FaCircleCheck, FaLocationDot, FaPaw } from 'react-icons/fa6'
import { LuLightbulb } from 'react-icons/lu'
import ActionLink, { ActionSkeleton } from '../shared/ActionLink'
import MatchBreakdown from '../shared/MatchBreakdown'
import NgoShield from '../shared/NgoShield'
import PetPhoto from '../shared/PetPhoto'
import ScoreSquare from '../shared/ScoreSquare'
import { explainMatchScore } from '../../../aumatch/utils/matchScore'
import { getPersonaActions } from '../../data/personaActions'
import { healthTags } from '../../utils/homePets'

const TEXT_LINK =
  'group inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2'

function EmptyResult({ speciesPreference }) {
  const isFilteringSpecies = speciesPreference && speciesPreference !== 'BOTH'

  return (
    <div className="flex flex-col items-center rounded-[2rem] bg-white px-6 py-14 text-center shadow-2xl shadow-black/30">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <FaPaw aria-hidden="true" size={22} />
      </span>
      <h3 className="mt-5 text-lg font-extrabold tracking-tight text-emerald-950">
        Nenhum pet disponível com esse perfil agora
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {isFilteringSpecies
          ? 'Tente "Ambos" na pergunta da espécie ou confira a lista completa.'
          : 'Assim que novos animais forem cadastrados, eles aparecem aqui.'}
      </p>
      <Link to="/animais" className={`${TEXT_LINK} mt-5`}>
        Ver todos os animais
        <FaArrowRight aria-hidden="true" size={11} />
      </Link>
    </div>
  )
}

// Botões do ranking: continuam no lugar quando um deles é escolhido, então
// o foco do teclado nunca "some" (aria-pressed marca o que está aberto)
function TopPetButton({ pet, rank, isSelected, isOwn, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={`flex min-w-0 items-center gap-3 rounded-2xl p-2 pr-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
        isSelected ? 'bg-emerald-50 ring-2 ring-emerald-600' : 'ring-1 ring-slate-200 hover:ring-emerald-300'
      }`}
    >
      <PetPhoto src={pet.photoUrl} width={160} className="h-12 w-12 shrink-0 rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-emerald-950">{pet.name}</span>
        <span className="block truncate text-xs text-slate-500">
          {rank}º lugar{isOwn && <span className="font-bold text-emerald-700"> · seu anúncio</span>}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-emerald-800 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white">
        {pet.matchScore}%
      </span>
    </button>
  )
}

function ResultActions({ persona }) {
  const actions = getPersonaActions(persona)

  if (!actions) return <ActionSkeleton />

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <ActionLink action={actions.primary} size="md" />
      {persona.kind === 'ong' && <ActionLink action={actions.secondary} variant="outline" size="md" />}
    </div>
  )
}

// Mesmo desenho do "Por que deu match?" do AUmatch (quadrado de score +
// linhas por critério), para a pessoa reconhecer o número lá dentro depois.
// isOwnAnswers: o perfil é o do quiz, sem edição — aí o texto diz "suas respostas"
function MatchResultCard({ persona, profile, isOwnAnswers, topPets, selected, onSelect }) {
  if (!selected) return <EmptyResult speciesPreference={profile.speciesPreference} />

  const { score, criteria } = explainMatchScore(profile, selected)
  const tags = healthTags(selected)
  const isNgo = selected.listingType === 'NGO'
  const isOwnPet = (pet) => !!persona.user && pet.ownerId === persona.user.id
  const isOwn = isOwnPet(selected)

  // sm+: foto e ranking na coluna estreita, explicação na larga ocupando as
  // duas linhas — o card fica mais baixo e cabe inteiro no sticky do desktop.
  // No mobile a ordem do DOM vale: foto, explicação, ranking
  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-2xl shadow-black/30 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:grid-rows-[auto_1fr] sm:gap-y-5">
        <div
          key={selected.id}
          className={`relative aspect-[4/5] max-h-[26rem] w-full overflow-hidden rounded-3xl bg-emerald-900 motion-safe:animate-[fade-slide-in_0.25s_ease-out_both] sm:col-start-1 sm:row-start-1 sm:max-h-none ${
            isNgo ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <PetPhoto
            src={selected.photoUrl}
            alt={`Foto de ${selected.name}`}
            width={640}
            className="absolute inset-0 h-full w-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent"
          />
          {isNgo && <NgoShield size="sm" className="absolute left-3 top-3" />}
          {isOwn && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-emerald-900 shadow-md">
              Seu anúncio
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-2xl font-black tracking-tight drop-shadow-sm">{selected.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
              <FaLocationDot aria-hidden="true" size={11} />
              {selected.city}, {selected.state}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col sm:col-start-2 sm:row-span-2 sm:row-start-1">
          <div className="flex items-center gap-4">
            <ScoreSquare score={score} />
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-emerald-950">
                <LuLightbulb aria-hidden="true" size={16} className="shrink-0 text-amber-500" />
                Por que deu match?
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {isOwnAnswers ? 'Com as suas respostas' : 'Com o perfil de teste'}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <MatchBreakdown criteria={criteria} variant="bars" />
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
            {tags.length > 0 ? (
              <ul aria-label="Saúde informada no anúncio" className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                  >
                    <FaCircleCheck aria-hidden="true" size={9} className="text-emerald-600" />
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <Link to={`/animais/${selected.id}`} className={TEXT_LINK}>
              Conhecer {selected.name}
              <FaArrowRight
                aria-hidden="true"
                size={11}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {topPets.length > 1 && (
          <div className="border-t border-slate-100 pt-5 sm:col-start-1 sm:row-start-2 sm:border-t-0 sm:pt-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Top {topPets.length} com este perfil
            </p>
            <div className="mt-2.5 flex flex-col gap-2">
              {topPets.map((pet, index) => (
                <TopPetButton
                  key={pet.id}
                  pet={pet}
                  rank={index + 1}
                  isSelected={pet.id === selected.id}
                  isOwn={isOwnPet(pet)}
                  onSelect={() => onSelect(pet.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <ResultActions persona={persona} />
      </div>
    </div>
  )
}

export default MatchResultCard
