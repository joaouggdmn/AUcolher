import HeroSection from '../components/Hero/HeroSection'
import MatchExplainedSection from '../components/MatchExplained/MatchExplainedSection'
import MatchPlaygroundSection from '../components/MatchPlayground/MatchPlaygroundSection'
import TrustJourneySection from '../components/TrustJourney/TrustJourneySection'
import BrowsePetsSection from '../components/BrowsePets/BrowsePetsSection'
import FinalCtaSection from '../components/FinalCta/FinalCtaSection'
import { useHomePersona } from '../hooks/useHomePersona'
import { useMatchProfile } from '../hooks/useMatchProfile'
import { useScrollToHash } from '../hooks/useScrollToHash'

// A home gira em torno do AUmatch: o hero mostra um match real explicado,
// "Como funciona" abre a conta dos 100 pontos e o simulador deixa testar.
// O perfil do simulador sobe até aqui porque o card do hero acompanha as
// respostas trocadas lá embaixo (e a vitrine evita repetir os pets do hero)
function HomePage() {
  const persona = useHomePersona()
  const sim = useMatchProfile(persona)
  useScrollToHash()

  return (
    <main>
      <HeroSection persona={persona} sim={sim} />
      <MatchExplainedSection />
      <MatchPlaygroundSection persona={persona} sim={sim} />
      <TrustJourneySection persona={persona} />
      <BrowsePetsSection persona={persona} sim={sim} />
      <FinalCtaSection persona={persona} />
    </main>
  )
}

export default HomePage
