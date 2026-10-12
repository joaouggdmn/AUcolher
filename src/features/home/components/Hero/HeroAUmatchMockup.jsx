import { FaDna, FaHeart, FaLocationDot, FaXmark } from 'react-icons/fa6'
import { LuLightbulb, LuSparkles } from 'react-icons/lu'
import PetPhoto from '../shared/PetPhoto'
import NgoShield from '../shared/NgoShield'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'

// Pet fictícia e fixa, de propósito: o hero explica o AUmatch para quem
// acabou de chegar, não busca animais (isso é só no /aumatch). As fotos não
// estão no seed, para ninguém achar que é um anúncio real
const EXAMPLE_PET = {
  name: 'Brisa',
  ageLabel: '2 anos',
  breed: 'SRD',
  city: 'Curitiba',
  state: 'PR',
  summary: 'Brincalhona, ama correr na praia e se dá bem com crianças.',
  matchScore: 92,
  photoUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80',
}

const BACK_PHOTOS = [
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80',
]

// Cartas de trás paradas, só para sugerir o deck
const BACK_CARD_STYLES = [
  '-translate-x-4 -rotate-[4deg] scale-[0.94] opacity-70',
  'translate-x-4 rotate-[4deg] scale-[0.94] opacity-45',
]

const STEPS = [
  {
    title: `Responda ${quizQuestions.length} perguntas`,
    description: 'Sobre a sua casa e a sua rotina. O AUmatch ordena os pets pela compatibilidade com você.',
  },
  {
    title: 'Veja o % de match',
    description: 'Toque no número e veja o porquê de cada ponto.',
  },
  {
    title: 'Curta para enviar seu interesse',
    description: 'Quem cuida do pet recebe o seu pedido. Passar não tem compromisso.',
  },
]

// Mesmo selo numerado dos passos da "Adoção segura": liga cada parte do
// card à legenda com o mesmo número
function Marker({ number, className = '' }) {
  return (
    <span
      className={`absolute z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-emerald-950 shadow-md shadow-amber-500/30 ring-4 ring-stone-50 ${className}`}
    >
      {number}
    </span>
  )
}

// Réplica estática do PetSwipeCard: nada arrasta, nada é clicável. O
// desenho é decorativo (aria-hidden); quem explica são as legendas em texto.
// id="match": o "Como funciona o match" do rodapé (/#match) cai aqui
function HeroAUmatchMockup() {
  const pet = EXAMPLE_PET

  return (
    <figure id="match" className="mx-auto flex w-full max-w-md scroll-mt-28 flex-col items-center xl:max-w-none">
      <p className="mb-6 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm ring-1 ring-emerald-100">
        Exemplo de card do AUmatch
      </p>

      <div className="flex w-full flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-8">
        <div aria-hidden="true" className="relative w-64 shrink-0 select-none sm:w-72 xl:w-64">
          <div className="relative">
            {BACK_PHOTOS.map((photo, index) => (
              <div
                key={photo}
                className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-emerald-900 shadow-lg shadow-emerald-950/10 ${BACK_CARD_STYLES[index]}`}
              >
                <PetPhoto src={photo} width={480} className="h-full w-full" />
              </div>
            ))}

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-emerald-900 shadow-2xl shadow-emerald-950/25 ring-2 ring-amber-400">
              <PetPhoto src={pet.photoUrl} width={640} eager className="absolute inset-0 h-full w-full" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              <NgoShield decorative className="absolute left-4 top-4" />

              <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-800/90 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 backdrop-blur-sm">
                <LuSparkles size={12} className="text-amber-300" />
                <span className="tabular-nums">{pet.matchScore}% match</span>
                <LuLightbulb size={13} className="text-amber-300" />
              </span>

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5 pb-10 text-white">
                <p className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight drop-shadow-sm">{pet.name}</span>
                  <span className="text-base font-medium text-white/80">{pet.ageLabel}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                  <span className="flex items-center gap-1.5">
                    <FaDna size={12} />
                    {pet.breed}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaLocationDot size={12} />
                    {pet.city}, {pet.state}
                  </span>
                </p>
                <p className="line-clamp-2 text-sm leading-snug text-white/85">{pet.summary}</p>
              </div>
            </div>

            <Marker number={1} className="-left-3 -top-3" />
            <Marker number={2} className="-right-3 -top-3" />
          </div>

          {/* Os mesmos botões de swipe do AUmatch, apoiados na borda do card */}
          <div className="relative z-10 -mt-7 flex justify-center gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-400 shadow-lg shadow-emerald-950/15 ring-1 ring-black/5">
              <FaXmark size={20} />
            </span>
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-lg shadow-amber-500/30">
              <FaHeart size={19} />
              <Marker number={3} className="-right-3 -top-3" />
            </span>
          </div>
        </div>

        <figcaption className="w-full max-w-sm xl:flex-1">
          <ol className="flex flex-col gap-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-emerald-950 shadow-md shadow-amber-500/30"
                >
                  {index + 1}
                </span>
                <p className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-base font-extrabold tracking-tight text-emerald-950">{step.title}</span>
                  <span className="text-sm leading-relaxed text-slate-600">{step.description}</span>
                </p>
              </li>
            ))}
          </ol>
        </figcaption>
      </div>
    </figure>
  )
}

export default HeroAUmatchMockup
