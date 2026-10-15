import { useNavigate } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa6'
import { useSentRequests } from '../../../../core/hooks/useSentRequests'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import AdoptedAnimalCard from './AdoptedAnimalCard'

// "Meus animais" → Adotados por mim: as adoções que a pessoa concluiu,
// inclusive as que depois voltaram ao doador ou foram repassadas
function AdoptedAnimalsTab() {
  const navigate = useNavigate()
  const { adoptedRequests } = useSentRequests()

  const goToChat = (requestId) => navigate('/chat', { state: { requestId } })

  if (adoptedRequests.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaHeart}
        title="Você ainda não adotou nenhum animal pela AUcolher."
        description="Quando você confirmar a chegada de um pet pelo chat, a adoção aparece aqui."
        action={{ to: '/aumatch', label: 'Ir para o AUmatch' }}
      />
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {adoptedRequests.map((request) => (
        <AdoptedAnimalCard key={request.id} request={request} onGoToChat={goToChat} />
      ))}
    </ul>
  )
}

export default AdoptedAnimalsTab
