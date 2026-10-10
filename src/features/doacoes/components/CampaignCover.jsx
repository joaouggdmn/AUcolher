import { getCategoriaMeta } from './filters/filterOptions'

// Capa é opcional: sem imagem, a campanha ganha um fundo da marca com o
// ícone da categoria, em vez de repetir a foto de outra campanha
function CampaignCover({ campaign, className = '' }) {
  if (campaign.coverUrl) {
    return <img src={campaign.coverUrl} alt={campaign.title} className={`h-full w-full object-cover ${className}`} />
  }

  const { icon: CategoriaIcon } = getCategoriaMeta(campaign.category)

  return (
    <div
      role="img"
      aria-label={campaign.title}
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-emerald-100/30 ${className}`}
    >
      <CategoriaIcon size={56} />
    </div>
  )
}

export default CampaignCover
