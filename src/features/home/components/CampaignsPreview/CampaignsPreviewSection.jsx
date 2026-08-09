import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'
import CampaignCard from '../../../doacoes/components/CampaignCard'
import DonationModal from '../../../doacoes/components/DonationModal'
import { mockCampanhas } from '../../../doacoes/data/mockCampanhas'
import RevealOnScroll from '../../../../core/components/ui/RevealOnScroll'

function CampaignsPreviewSection() {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const featured = mockCampanhas.slice(0, 3)

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">Apoie quem cuida</span>
            <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Campanhas de ONGs verificadas
            </h2>
            <p className="mt-3 max-w-lg text-slate-600">
              Cada real doado ajuda diretamente uma causa real, acompanhada de perto pela nossa equipe de verificação.
            </p>
          </div>

          <Link
            to="/campanhas"
            className="group flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-700 hover:bg-emerald-800 hover:text-white"
          >
            Ver todas as campanhas
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((campaign, index) => (
            <RevealOnScroll key={campaign.id} delay={index * 120}>
              <CampaignCard campaign={campaign} onDonate={setSelectedCampaign} />
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </section>
  )
}

export default CampaignsPreviewSection