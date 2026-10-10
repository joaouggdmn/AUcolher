import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import { getErrorMessage } from '../../../core/utils/apiError'
import CampaignForm from '../components/CampaignForm'
import { useCreateCampaign } from '../hooks/useCampanhas'
import { buildNewCampaignForm } from '../utils/campaignForm'

function CampaignCreatePage() {
  const navigate = useNavigate()
  const createCampaign = useCreateCampaign()
  // Formulário novo nasce uma vez só
  const [initialValues] = useState(buildNewCampaignForm)

  const handleSubmit = (values) => {
    createCampaign.mutate(values, {
      onSuccess: (campaign) => navigate(`/campanhas/${campaign.id}`, { state: { flash: 'Campanha publicada!' } }),
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Nova campanha
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
          Conte por que sua ONG precisa de ajuda
        </h1>
        <p className="max-w-lg text-sm text-slate-500">
          A campanha aparece na vitrine de campanhas, na página inicial e no perfil da sua ONG. As doações chegam por PIX.
        </p>
      </div>

      <CampaignForm
        initialValues={initialValues}
        submitLabel="Publicar campanha"
        isSubmitting={createCampaign.isPending}
        submitError={createCampaign.error ? getErrorMessage(createCampaign.error) : null}
        onSubmit={handleSubmit}
        cancelTo="/campanhas"
      />
    </div>
  )
}

export default CampaignCreatePage
