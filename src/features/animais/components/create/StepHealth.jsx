import ToggleSwitch from '../../../../core/components/ui/filters/ToggleSwitch'

const HEALTH_FIELDS = [
  { key: 'vaccinated', label: 'Vacinado' },
  { key: 'neutered', label: 'Castrado' },
  { key: 'dewormed', label: 'Vermifugado' },
  { key: 'specialNeeds', label: 'Possui necessidades especiais' },
]

function StepHealth({ formData, onChange }) {
  return (
    <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-5">
      {HEALTH_FIELDS.map((field) => (
        <div key={field.key} className="py-4">
          <ToggleSwitch label={field.label} checked={formData[field.key]} onChange={() => onChange(field.key, !formData[field.key])} />
        </div>
      ))}
    </div>
  )
}

export default StepHealth