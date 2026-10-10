import { useState } from 'react'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { LISTING_STATUS_META } from '../../../animais/utils/listingStatus'
import MyAnimalsPanel from '../../../perfil/components/activity/MyAnimalsPanel'
import BarList from './charts/BarList'
import ChartCard from './charts/ChartCard'
import StackedBar from './charts/StackedBar'

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'ADOPTED', 'INACTIVE']

// Paleta conferida para daltonismo e contraste; "fora do ar"
// fica em cinza de propósito: é o status que não pede atenção
const STATUS_COLORS = {
  AVAILABLE: 'bg-emerald-700',
  IN_PROGRESS: 'bg-amber-600',
  ADOPTED: 'bg-sky-600',
  INACTIVE: 'bg-slate-300',
}

const SPECIES = [
  { key: 'DOG', label: 'Cães' },
  { key: 'CAT', label: 'Gatos' },
  { key: 'OTHER', label: 'Outros' },
]

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
  const speciesBars = SPECIES.map(({ key, label }) => ({
    key,
    label,
    value: animals.filter((animal) => animal.species === key).length,
    colorClass: 'bg-emerald-600',
  })).filter((bar) => bar.key !== 'OTHER' || bar.value > 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <ChartCard title="Situação dos anúncios" subtitle={`${animals.length} ${animals.length === 1 ? 'animal cadastrado' : 'animais cadastrados'}`}>
          <p className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-emerald-950">{countByStatus.AVAILABLE}</span>
            <span className="text-sm font-semibold text-slate-500">
              {countByStatus.AVAILABLE === 1 ? 'disponível para adoção' : 'disponíveis para adoção'}
            </span>
          </p>
          <StackedBar
            segments={STATUS_ORDER.map((status) => ({
              key: status,
              label: LISTING_STATUS_META[status].label,
              value: countByStatus[status],
              colorClass: STATUS_COLORS[status],
            }))}
          />
        </ChartCard>

        <ChartCard title="Por espécie">
          <BarList items={speciesBars} />
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
