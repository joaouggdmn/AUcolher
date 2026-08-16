import FormField from '../../../../core/components/ui/FormField'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'

const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Cão' },
  { value: 'CAT', label: 'Gato' },
  { value: 'OTHER', label: 'Outro' },
]
const SEX_OPTIONS = [
  { value: 'M', label: 'Macho' },
  { value: 'F', label: 'Fêmea' },
]
const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
]
const AGE_UNIT_OPTIONS = [
  { value: 'ANOS', label: 'Anos' },
  { value: 'MESES', label: 'Meses' },
]

function StepBasicInfo({ formData, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <FormField label="Nome do pet" value={formData.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Ex: Thor" />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Espécie</label>
        <PillToggleGroup options={SPECIES_OPTIONS} value={formData.species} onChange={(v) => onChange('species', v)} />
      </div>

      <FormField label="Raça" value={formData.breed} onChange={(e) => onChange('breed', e.target.value)} placeholder="Ex: Vira-lata" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Idade"
          type="number"
          min="0"
          value={formData.ageValue}
          onChange={(e) => onChange('ageValue', e.target.value)}
          placeholder="Ex: 2"
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Unidade</label>
          <PillToggleGroup options={AGE_UNIT_OPTIONS} value={formData.ageUnit} onChange={(v) => onChange('ageUnit', v)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Sexo</label>
        <PillToggleGroup options={SEX_OPTIONS} value={formData.sex} onChange={(v) => onChange('sex', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Porte</label>
        <PillToggleGroup options={SIZE_OPTIONS} value={formData.size} onChange={(v) => onChange('size', v)} />
      </div>
    </div>
  )
}

export default StepBasicInfo