import { useAuth } from '../../../../core/context/AuthContext'
import PanelPage from '../../../../core/components/panel/PanelPage'
import { useUserReviews } from '../../../avaliacoes/hooks/useUserReviews'
import ProfileReviewsList from '../../../perfil/components/public/ProfileReviewsList'

function ReviewsPage() {
  const { user } = useAuth()
  const reviews = useUserReviews(user?.id)

  return (
    <PanelPage
      title="Avaliações"
      description="Deixadas por quem adotou um animal da ONG, depois que a adoção é concluída. Aparecem no perfil público."
    >
      <ProfileReviewsList {...reviews} />
    </PanelPage>
  )
}

export default ReviewsPage
