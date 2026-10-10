import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHandHoldingHeart, FaPlus } from 'react-icons/fa6'
import CampaignCard from '../../../doacoes/components/CampaignCard'
import CampaignCardSkeleton from '../../../doacoes/components/CampaignCardSkeleton'
import DonationModal from '../../../doacoes/components/DonationModal'

const SKELETON_COUNT = 3

// Aba "Campanhas" do perfil público da ONG: só as ativas, como na vitrine.
// Quem vê o próprio perfil ganha o atalho para abrir uma campanha
function OngCampaignsTab({ campaigns, isLoading, isError, ongName, isOwnProfile }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CampaignCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError || campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaHandHoldingHeart size={18} />
        </span>
        <p className="text-sm font-semibold text-slate-600">
          {isError
            ? 'Não foi possível carregar as campanhas agora. Tente novamente em instantes.'
            : `${ongName} não tem campanhas abertas no momento.`}
        </p>
        {isOwnProfile && !isError && (
          <Link
            to="/campanhas/criar"
            className="mt-3 flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            <FaPlus size={12} />
            Criar campanha
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} onDonate={setSelectedCampaign} />
        ))}
      </div>

      {selectedCampaign && (
        <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </>
  )
}

export default OngCampaignsTab
