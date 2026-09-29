import HeroSection from '../components/Hero/HeroSection'
import MatchPlaygroundSection from '../components/MatchPlayground/MatchPlaygroundSection'
import TrustJourneySection from '../components/TrustJourney/TrustJourneySection'
import OngShowcaseSection from '../components/OngShowcase/OngShowcaseSection'
import BrowsePetsSection from '../components/BrowsePets/BrowsePetsSection'
import FinalCtaSection from '../components/FinalCta/FinalCtaSection'
import { useHomePersona } from '../hooks/useHomePersona'
import { useMatchProfile } from '../hooks/useMatchProfile'
import { useScrollToHash } from '../hooks/useScrollToHash'

// Home e landing ao mesmo tempo: o hero mostra um match real explicado, o
// simulador deixa testar, e cada seção termina num atalho para uma parte do
// sistema (AUmatch, ONGs, campanhas, eventos, animais).
// O perfil do simulador sobe até aqui porque o card do hero acompanha as
// respostas trocadas lá embaixo (e a vitrine evita repetir os pets do hero)
function HomePage() {
  const persona = useHomePersona()
  const sim = useMatchProfile(persona)
  useScrollToHash()

  return (
    <main>
      <HeroSection persona={persona} sim={sim} />
      <MatchPlaygroundSection persona={persona} sim={sim} />
      <TrustJourneySection persona={persona} />
      <OngShowcaseSection persona={persona} />
      <BrowsePetsSection persona={persona} sim={sim} />
      <FinalCtaSection persona={persona} />
    </main>
  )
}

export default HomePage
