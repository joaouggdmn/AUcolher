import HeroSection from '../components/Hero/HeroSection'
import ShortcutsSection from '../components/Shortcuts/ShortcutsSection'
import OngShowcaseSection from '../components/OngShowcase/OngShowcaseSection'
import BrowsePetsSection from '../components/BrowsePets/BrowsePetsSection'
import TrustJourneySection from '../components/TrustJourney/TrustJourneySection'
import { useHomePersona } from '../hooks/useHomePersona'
import { useScrollToHash } from '../hooks/useScrollToHash'

// Home e landing ao mesmo tempo: o hero explica o AUmatch com um card de
// exemplo fixo (a busca de pets em si é só no /aumatch), os atalhos mostram o
// próximo passo de cada público, as vitrines mostram ONGs e animais reais e a
// "Adoção segura" fecha a página com o caminho até o lar
function HomePage() {
  const persona = useHomePersona()
  useScrollToHash()

  return (
    <main>
      <HeroSection persona={persona} />
      <ShortcutsSection persona={persona} />
      <OngShowcaseSection persona={persona} />
      <BrowsePetsSection persona={persona} />
      <TrustJourneySection persona={persona} />
    </main>
  )
}

export default HomePage
