import HeroSection from '../components/Hero/HeroSection'
import MatchStepByStep from '../components/MatchStepByStep/MatchStepByStep'
import CampaignsPreviewSection from '../components/CampaignsPreview/CampaignsPreviewSection'
import EventsPreviewSection from '../components/EventsPreview/EventsPreviewSection'
import ProfileSplitCta from '../components/FinalCta/ProfileSplitCta'

function HomePage() {
  return (
    <main>
      <HeroSection />
      <MatchStepByStep />
      <CampaignsPreviewSection />
      <EventsPreviewSection />
      <ProfileSplitCta />
    </main>
  )
}

export default HomePage