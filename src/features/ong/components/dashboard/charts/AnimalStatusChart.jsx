import { animalStatusSegments } from '../../../utils/panelCharts'
import ChartCard from './ChartCard'
import StackedBar from './StackedBar'

function AnimalStatusChart({ animals }) {
  const segments = animalStatusSegments(animals)
  const available = segments.find((segment) => segment.key === 'AVAILABLE').value

  return (
    <ChartCard
      title="Situação dos anúncios"
      subtitle={`${animals.length} ${animals.length === 1 ? 'animal cadastrado' : 'animais cadastrados'}`}
    >
      <p className="flex items-baseline gap-2">
        <span className="text-4xl font-black tracking-tight text-emerald-950">{available}</span>
        <span className="text-sm font-semibold text-slate-500">
          {available === 1 ? 'disponível para adoção' : 'disponíveis para adoção'}
        </span>
      </p>
      <StackedBar segments={segments} />
    </ChartCard>
  )
}

export default AnimalStatusChart
