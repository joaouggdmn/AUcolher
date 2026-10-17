import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import HeroSection from '../components/Hero/HeroSection'
import FinalCtaSection from '../components/FinalCta/FinalCtaSection'
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
  const location = useLocation()

  // Aviso vindo de outra tela (ex.: "Sua conta foi excluída.")
  const [dismissedFlashKey, setDismissedFlashKey] = useState(null)
  const flash = location.state?.flash && dismissedFlashKey !== location.key ? location.state.flash : null
  const closeToast = useCallback(() => setDismissedFlashKey(location.key), [location.key])

  return (
    <main>
      <SuccessToast message={flash} onClose={closeToast} />
      <HeroSection persona={persona} />
      <FinalCtaSection persona={persona} />
      <OngShowcaseSection persona={persona} />
      <BrowsePetsSection persona={persona} />
      <TrustJourneySection persona={persona} />
    </main>
  )
}

export default HomePage
