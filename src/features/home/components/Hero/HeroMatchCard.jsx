import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaDna, FaLocationDot, FaPaw } from 'react-icons/fa6'
import { LuLightbulb, LuSparkles } from 'react-icons/lu'
import PetPhoto from '../shared/PetPhoto'
import NgoShield from '../shared/NgoShield'
import HeroReceipt from './HeroReceipt'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'

// Cartas de trás paradas, só para sugerir o deck do AUmatch — nada gira
// ou anda sozinho no hero
const BACK_CARD_STYLES = [
  '-translate-x-4 -rotate-[4deg] scale-[0.94] opacity-70',
  'translate-x-4 rotate-[4deg] scale-[0.94] opacity-45',
]

const CONTROL_BUTTON =
  'flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:ring-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50'

function optionLabel(key, value) {
  return quizQuestions.find((question) => question.key === key)?.options.find((option) => option.value === value)?.label
}

// Diz de onde vem o percentual do card, para ninguém achar que o número do
// exemplo é sobre a própria pessoa
function getContextLabel(kind, sim, isOwnShowcase) {
  if (kind === 'matched') return 'Seus melhores matches agora'
  if (kind === 'ong') return isOwnShowcase ? 'Seus anúncios pelos olhos de quem adota' : 'Exemplo de anúncio de ONG verificada'
  if (sim.isDirty) return 'Com as respostas do simulador'
  if (kind === 'pending') return 'Suas respostas + exemplo nas que faltam'

  const summary = ['moradia', 'rotinaExercicio'].map((key) => optionLabel(key, sim.profile[key])).filter(Boolean)
  return ['Perfil de exemplo', ...summary].join(' · ')
}

function MatchCardSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[21rem] sm:max-w-sm xl:max-w-80">
      <div className="mb-4 h-6 w-52 rounded-full bg-slate-200/70 motion-safe:animate-pulse" />
      <div className="aspect-[4/5] rounded-[2rem] bg-slate-200/70 motion-safe:animate-pulse" />
    </div>
  )
}

function EmptyShowcase() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-[2rem] bg-white p-8 text-center shadow-xl shadow-emerald-950/10 ring-1 ring-slate-100">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <FaPaw aria-hidden="true" size={22} />
      </span>
      <p className="mt-5 text-lg font-extrabold tracking-tight text-emerald-950">Nenhum pet disponível agora</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Novos animais aparecem aqui assim que ONGs e tutores cadastram.
      </p>
      <Link
        to="/animais"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      >
        Ver todos os animais
        <FaArrowRight aria-hidden="true" size={11} />
      </Link>
    </div>
  )
}

function HeroMatchCard({ persona, sim, featured }) {
  const { pets, profile, isOwnShowcase } = featured
  const [selectedId, setSelectedId] = useState(null)
  const receiptTitleRef = useRef(null)

  if (persona.kind === 'loading') return <MatchCardSkeleton />
  if (pets.length === 0) return <EmptyShowcase />

  // Se o pet escolhido saiu do top 3 (o simulador mudou o ranking), o card
  // volta para o primeiro — derivado aqui, sem effect de sincronização
  const index = Math.max(0, pets.findIndex((pet) => pet.id === selectedId))
  const pet = pets[index]
  const total = pets.length
  const backPets = [pets[(index + 1) % total], pets[(index + 2) % total]].slice(0, total - 1)
  const isNgo = pet.listingType === 'NGO'

  const showPet = (step) => setSelectedId(pets[(index + step + total) % total].id)

  return (
    <div className="relative mx-auto w-full max-w-[21rem] sm:max-w-sm xl:flex xl:max-w-none xl:items-center xl:justify-center">
      <div className="xl:w-80 xl:shrink-0">
        <p className="mb-4 inline-flex max-w-full rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm ring-1 ring-emerald-100">
          {getContextLabel(persona.kind, sim, isOwnShowcase)}
        </p>

        <div className="relative">
          {backPets.map((backPet, backIndex) => (
            <div
              key={backPet.id}
              aria-hidden="true"
              className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-emerald-900 shadow-lg shadow-emerald-950/10 ${BACK_CARD_STYLES[backIndex]}`}
            >
              <PetPhoto src={backPet.photoUrl} width={480} className="h-full w-full" />
            </div>
          ))}

          <div
            key={pet.id}
            className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-emerald-900 shadow-2xl shadow-emerald-950/25 motion-safe:animate-[fade-slide-in_0.25s_ease-out_both] ${
              isNgo ? 'ring-2 ring-amber-400' : 'ring-1 ring-black/5'
            }`}
          >
            <PetPhoto
              src={pet.photoUrl}
              alt={`Foto de ${pet.name}`}
              width={800}
              eager
              className="absolute inset-0 h-full w-full"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
            />

            {isNgo && <NgoShield className="absolute left-4 top-4" />}

            <button
              type="button"
              aria-controls="hero-receipt"
              aria-label={`${pet.matchScore}% de compatibilidade — ver por que deu match`}
              onClick={() => receiptTitleRef.current?.focus()}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-800/90 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 backdrop-blur-sm transition-colors duration-300 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <LuSparkles aria-hidden="true" size={12} className="text-amber-300" />
              <span className="tabular-nums">{pet.matchScore}% match</span>
              <LuLightbulb aria-hidden="true" size={13} className="text-amber-300" />
            </button>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6 text-white">
              <p className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight drop-shadow-sm">{pet.name}</span>
                <span className="text-base font-medium text-white/80">{pet.ageLabel}</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                <span className="flex items-center gap-1.5">
                  <FaDna aria-hidden="true" size={12} />
                  {pet.breed}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaLocationDot aria-hidden="true" size={12} />
                  {pet.city}, {pet.state}
                </span>
              </p>
              {pet.summary && <p className="line-clamp-2 text-sm leading-snug text-white/85">{pet.summary}</p>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          {total > 1 ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => showPet(-1)} aria-label="Pet anterior" className={CONTROL_BUTTON}>
                <FaChevronLeft aria-hidden="true" size={13} />
              </button>
              <p className="min-w-12 text-center text-sm font-semibold tabular-nums text-slate-600">
                {index + 1} de {total}
              </p>
              <button type="button" onClick={() => showPet(1)} aria-label="Próximo pet" className={CONTROL_BUTTON}>
                <FaChevronRight aria-hidden="true" size={13} />
              </button>
            </div>
          ) : (
            <span />
          )}

          <Link
            to={`/animais/${pet.id}`}
            className="group inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
          >
            Conhecer {pet.name}
            <FaArrowRight
              aria-hidden="true"
              size={11}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      <HeroReceipt
        pet={pet}
        profile={profile}
        titleRef={receiptTitleRef}
        className="relative z-10 mt-6 xl:order-first xl:-mr-4 xl:mt-0 xl:w-72 xl:shrink-0"
      />
    </div>
  )
}

export default HeroMatchCard
