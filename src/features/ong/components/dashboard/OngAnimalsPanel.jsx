import { useState } from 'react'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { LISTING_STATUS_META } from '../../../animais/utils/listingStatus'
import MyAnimalsPanel from '../../../perfil/components/activity/MyAnimalsPanel'

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'ADOPTED', 'INACTIVE']

// Aba "Animais": os anúncios da ONG em qualquer status (GET /animals/mine),
// com o status calculado a partir dos pedidos de adoção
function OngAnimalsPanel({ animals, isLoading, error, onRetry }) {
  const [statusFilter, setStatusFilter] = useState('')

  if (isLoading) return <Spinner />
  if (error) {
    return <LoadErrorState title="Não foi possível carregar os animais" message={getErrorMessage(error)} onRetry={onRetry} />
  }
  // Lista vazia já traz o convite para cadastrar
  if (animals.length === 0) return <MyAnimalsPanel animals={animals} />

  const countByStatus = Object.fromEntries(
    STATUS_ORDER.map((status) => [status, animals.filter((animal) => animal.listingStatus === status).length])
  )
  const filterOptions = [
    { value: '', label: `Todos (${animals.length})` },
    ...STATUS_ORDER.filter((status) => countByStatus[status] > 0).map((status) => ({
      value: status,
      label: `${LISTING_STATUS_META[status].label} (${countByStatus[status]})`,
    })),
  ]
  const visible = statusFilter ? animals.filter((animal) => animal.listingStatus === statusFilter) : animals

  return (
    <div className="flex flex-col gap-4">
      <PillToggleGroup options={filterOptions} value={statusFilter} onChange={setStatusFilter} />
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Nenhum animal com esse status agora.</p>
      ) : (
        <MyAnimalsPanel animals={visible} />
      )}
    </div>
  )
}

export default OngAnimalsPanel
