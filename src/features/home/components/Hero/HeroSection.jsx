import HeroCopy from './HeroCopy'
import HeroAUmatchMockup from './HeroAUmatchMockup'
import PlatformStatsBar from './PlatformStatsBar'
import HomeSearch from '../Search/HomeSearch'
import NearbyButton from '../Search/NearbyButton'
import { useRankedPets } from '../../hooks/useRankedPets'

// Pontilhado bem sutil, apagando nas bordas: textura sem competir com o texto
const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(#064e3b 1.2px, transparent 1.2px)',
  backgroundSize: '28px 28px',
  maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, #000 30%, transparent 100%)',
  WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, #000 30%, transparent 100%)',
}

// O visual do hero é fixo e igual para todos: um card de exemplo do AUmatch
// explicando o fluxo. Só o texto e os botões mudam por público; o deck real
// entra apenas para citar o melhor match de quem já fez o quiz
function HeroSection({ persona }) {
  const { kind, user } = persona
  const deck = useRankedPets(kind === 'matched' ? user : null, { excludeRequested: true })

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-stone-50 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pt-36"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-amber-300/20 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={DOT_PATTERN} />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-x-10">
        <div className="flex flex-col items-start gap-6 lg:col-span-6">
          <HeroCopy persona={persona} deck={deck} />

          <div className="mt-2 flex w-full max-w-xl flex-col gap-2.5">
            <p id="home-search-title" className="text-sm font-semibold text-slate-500">
              Prefere buscar do seu jeito?
            </p>
            <HomeSearch labelledBy="home-search-title" />
            <NearbyButton variant="link" className="pl-1" />
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroAUmatchMockup />
        </div>
      </div>

      <PlatformStatsBar />
    </section>
  )
}

export default HeroSection
