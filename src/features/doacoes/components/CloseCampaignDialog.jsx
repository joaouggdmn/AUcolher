import { FaLock } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import { useCloseCampaign } from '../hooks/useCampanhas'

// Encerrar antes do prazo: a campanha continua visível como "Encerrada",
// para de receber doações e os PIX ainda não pagos são cancelados.
// `onClosed(message)` recebe o texto do toast
function CloseCampaignDialog({ campaign, onClose, onClosed }) {
  const closeCampaign = useCloseCampaign()

  const handleConfirm = () => {
    closeCampaign.mutate(campaign.id, {
      onSuccess: () => onClosed('Campanha encerrada. Ela continua visível, mas não recebe mais doações.'),
    })
  }

  return (
    <ConfirmDialog
      icon={FaLock}
      title="Encerrar esta campanha?"
      description={
        <>
          <strong className="text-emerald-950">{campaign.title}</strong> para de receber doações agora, com{' '}
          {formatCurrency(campaign.raisedAmount)} arrecadados. Ela continua visível como encerrada, e quem estiver com um
          PIX aberto terá o pagamento cancelado. Não dá para reabrir.
        </>
      }
      confirmLabel="Sim, encerrar campanha"
      processingLabel="Encerrando..."
      isProcessing={closeCampaign.isPending}
      error={closeCampaign.error ? getErrorMessage(closeCampaign.error) : null}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}

export default CloseCampaignDialog
