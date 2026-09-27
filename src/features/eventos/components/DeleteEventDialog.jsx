import { FaCalendarXmark, FaTrashCan } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import { useDeleteEvent } from '../hooks/useEventos'

// Excluir sempre é permitido, mas o efeito depende de quem já confirmou
// (regras §10): sem confirmados o evento some de vez; com confirmados ele
// vira CANCELADO e continua em Minha conta de quem ia participar.
// `onDeleted(message)` recebe o texto do toast
function DeleteEventDialog({ event, onClose, onDeleted }) {
  const deleteEvent = useDeleteEvent()
  const confirmed = event.confirmedCount
  const hasAttendees = confirmed > 0

  const handleConfirm = () => {
    deleteEvent.mutate(event.id, {
      onSuccess: () =>
        onDeleted(
          hasAttendees
            ? 'Evento cancelado. Quem confirmou presença vai vê-lo como cancelado.'
            : 'Evento excluído.'
        ),
    })
  }

  return (
    <ConfirmDialog
      variant="danger"
      icon={hasAttendees ? FaCalendarXmark : FaTrashCan}
      title={hasAttendees ? 'Cancelar este evento?' : 'Excluir este evento?'}
      description={
        hasAttendees ? (
          <>
            <strong className="text-emerald-950">
              {confirmed} {confirmed === 1 ? 'pessoa já confirmou' : 'pessoas já confirmaram'} presença
            </strong>
            , então o evento não é apagado: ele sai da vitrine e aparece como cancelado em Minha conta de quem ia
            participar. Não dá para desfazer.
          </>
        ) : (
          <>
            <strong className="text-emerald-950">{event.title}</strong> será apagado definitivamente. Não dá para
            desfazer.
          </>
        )
      }
      confirmLabel={hasAttendees ? 'Sim, cancelar evento' : 'Sim, excluir evento'}
      processingLabel={hasAttendees ? 'Cancelando...' : 'Excluindo...'}
      isProcessing={deleteEvent.isPending}
      error={deleteEvent.error ? getErrorMessage(deleteEvent.error) : null}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}

export default DeleteEventDialog
