import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'

const ENERGY_OPTIONS = [
  { value: 'LOW', label: 'Baixo' },
  { value: 'MODERATE', label: 'Moderado' },
  { value: 'HIGH', label: 'Alto' },
]
const YES_NO_OPTIONS = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
]

function StepCompatibility({ formData, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Nível de energia</label>
        <PillToggleGroup options={ENERGY_OPTIONS} value={formData.energyLevel} onChange={(v) => onChange('energyLevel', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Dá bem com crianças?</label>
        <PillToggleGroup options={YES_NO_OPTIONS} value={formData.goodWithChildren} onChange={(v) => onChange('goodWithChildren', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Dá bem com outros cães?</label>
        <PillToggleGroup options={YES_NO_OPTIONS} value={formData.goodWithDogs} onChange={(v) => onChange('goodWithDogs', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Dá bem com gatos?</label>
        <PillToggleGroup options={YES_NO_OPTIONS} value={formData.goodWithCats} onChange={(v) => onChange('goodWithCats', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Indicado para apartamento?</label>
        <PillToggleGroup options={YES_NO_OPTIONS} value={formData.apartmentFriendly} onChange={(v) => onChange('apartmentFriendly', v)} />
      </div>
    </div>
  )
}

export default StepCompatibility