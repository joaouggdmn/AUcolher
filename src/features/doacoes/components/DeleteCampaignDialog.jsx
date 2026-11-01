import { FaTrashCan } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import { useDeleteCampaign } from '../hooks/useCampanhas'

// Excluir sempre é permitido, mas o efeito depende das doações (plano §1):
// sem doações confirmadas a campanha some de vez; com doações ela sai de
// todas as telas, mas continua no histórico de quem doou e nas doações
// recebidas da ONG. `onDeleted(message)` recebe o texto do toast
function DeleteCampaignDialog({ campaign, onClose, onDeleted }) {
  const deleteCampaign = useDeleteCampaign()
  const donations = campaign.donationsCount
  const hasDonations = donations > 0

  const handleConfirm = () => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () =>
        onDeleted(
          hasDonations
            ? 'Campanha removida. As doações continuam no histórico de quem doou.'
            : 'Campanha excluída.'
        ),
    })
  }

  return (
    <ConfirmDialog
      variant="danger"
      icon={FaTrashCan}
      title={hasDonations ? 'Remover esta campanha?' : 'Excluir esta campanha?'}
      description={
        hasDonations ? (
          <>
            <strong className="text-emerald-950">
              {donations} {donations === 1 ? 'doação já foi confirmada' : 'doações já foram confirmadas'}
            </strong>
            , então a campanha sai da vitrine e do seu perfil, mas fica registrada no histórico de quem doou e nas suas
            doações recebidas. Não dá para desfazer.
          </>
        ) : (
          <>
            <strong className="text-emerald-950">{campaign.title}</strong> será apagada definitivamente. Não dá para
            desfazer.
          </>
        )
      }
      confirmLabel={hasDonations ? 'Sim, remover campanha' : 'Sim, excluir campanha'}
      processingLabel={hasDonations ? 'Removendo...' : 'Excluindo...'}
      isProcessing={deleteCampaign.isPending}
      error={deleteCampaign.error ? getErrorMessage(deleteCampaign.error) : null}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}

export default DeleteCampaignDialog
