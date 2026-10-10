import { useState } from 'react'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { LISTING_STATUS_META } from '../../../animais/utils/listingStatus'
import MyAnimalsPanel from '../../../perfil/components/activity/MyAnimalsPanel'
import { animalStatusSegments, speciesBars } from '../../utils/panelCharts'
import AnimalStatusChart from './charts/AnimalStatusChart'
import BarList from './charts/BarList'
import ChartCard from './charts/ChartCard'

// Os anúncios da ONG em qualquer status (GET /animals/mine), com o status
// calculado a partir dos pedidos de adoção
function OngAnimalsPanel({ animals, isLoading, error, onRetry }) {
  const [statusFilter, setStatusFilter] = useState('')

  if (isLoading) return <Spinner />
  if (error) {
    return <LoadErrorState title="Não foi possível carregar os animais" message={getErrorMessage(error)} onRetry={onRetry} />
  }
  // Lista vazia já traz o convite para cadastrar
  if (animals.length === 0) return <MyAnimalsPanel animals={animals} />

  const segments = animalStatusSegments(animals)
  const filterOptions = [
    { value: '', label: `Todos (${animals.length})` },
    ...segments
      .filter((segment) => segment.value > 0)
      .map((segment) => ({ value: segment.key, label: `${LISTING_STATUS_META[segment.key].label} (${segment.value})` })),
  ]
  const visible = statusFilter ? animals.filter((animal) => animal.listingStatus === statusFilter) : animals

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <AnimalStatusChart animals={animals} />
        <ChartCard title="Por espécie">
          <BarList items={speciesBars(animals)} />
        </ChartCard>
      </div>

      <div className="flex flex-col gap-4">
        <PillToggleGroup options={filterOptions} value={statusFilter} onChange={setStatusFilter} />
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nenhum animal com esse status agora.</p>
        ) : (
          <MyAnimalsPanel animals={visible} />
        )}
      </div>
    </div>
  )
}

export default OngAnimalsPanel
