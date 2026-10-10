// components/CampaignsGrid.jsx
import CampaignCard from './CampaignCard'
import CampaignCardSkeleton from './CampaignCardSkeleton'
import EmptyState from './EmptyState'

const SKELETON_COUNT = 6

function CampaignsGrid({ campaigns, isLoading, hasActiveFilters, onDonate, onClearFilters }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CampaignCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onDonate={onDonate} />
      ))}
    </div>
  )
}

export default CampaignsGrid
