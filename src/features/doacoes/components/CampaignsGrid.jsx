// components/CampaignsGrid.jsx
import CampaignCard from './CampaignCard'
import EmptyState from './EmptyState'

function CampaignsGrid({ campaigns, onDonate, onClearFilters }) {
  if (campaigns.length === 0) return <EmptyState onClearFilters={onClearFilters} />

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onDonate={onDonate} />
      ))}
    </div>
  )
}

export default CampaignsGrid