import FormField from '../../../../core/components/ui/FormField'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { BRAZILIAN_STATES } from '../../../../core/utils/brazilianStates'
import { useCepLookup } from '../../../../core/hooks/useCepLookup' // 🆕
import CepField from '../../../../core/components/ui/CepField' // 🆕
import { AGE_RULE_HINT, isValidAge } from '../../utils/ageHelpers'
import { BREED_MAX_LENGTH, NAME_MAX_LENGTH } from '../../hooks/useAnimalForm'

const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Cão' }, { value: 'CAT', label: 'Gato' }, { value: 'OTHER', label: 'Outro' },
]
const SEX_OPTIONS = [{ value: 'MALE', label: 'Macho' }, { value: 'FEMALE', label: 'Fêmea' }]
const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Pequeno' }, { value: 'MEDIUM', label: 'Médio' }, { value: 'LARGE', label: 'Grande' },
]
const AGE_UNIT_OPTIONS = [{ value: 'YEARS', label: 'Anos' }, { value: 'MONTHS', label: 'Meses' }]

function StepBasicInfo({ formData, onChange, showLocationFields }) {
  // 🆕 Preenche cidade/estado automaticamente assim que o CEP é resolvido —
  // os campos continuam editáveis manualmente, caso o CEP falhe ou o
  // usuário prefira ajustar
  const { cep, status: cepStatus, errorMessage: cepError, handleCepChange } = useCepLookup((address) => {
    onChange('city', address.city)
    onChange('state', address.state)
  })

  // Só acusa depois que algo foi digitado — campo vazio já trava o "Próximo"
  const showAgeError = formData.ageValue !== '' && !isValidAge(formData.ageValue, formData.ageUnit)

  return (
    <div className="flex flex-col gap-6">
      <FormField label="Nome do pet" value={formData.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Ex: Thor" maxLength={NAME_MAX_LENGTH} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Espécie</label>
        <PillToggleGroup options={SPECIES_OPTIONS} value={formData.species} onChange={(v) => onChange('species', v)} />
      </div>

      <FormField label="Raça" value={formData.breed} onChange={(e) => onChange('breed', e.target.value)} placeholder="Ex: Vira-lata" maxLength={BREED_MAX_LENGTH} />

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Idade" type="number" min="0" max={formData.ageUnit === 'MONTHS' ? 11 : 30} value={formData.ageValue} onChange={(e) => onChange('ageValue', e.target.value)} placeholder="Ex: 2" />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Unidade</label>
            <PillToggleGroup options={AGE_UNIT_OPTIONS} value={formData.ageUnit} onChange={(v) => onChange('ageUnit', v)} />
          </div>
        </div>
        <p className={`text-xs ${showAgeError ? 'font-semibold text-rose-500' : 'text-slate-400'}`}>
          {showAgeError ? `Idade inválida: ${AGE_RULE_HINT.toLowerCase()}` : AGE_RULE_HINT}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Sexo</label>
        <PillToggleGroup options={SEX_OPTIONS} value={formData.sex} onChange={(v) => onChange('sex', v)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Porte</label>
        <PillToggleGroup options={SIZE_OPTIONS} value={formData.size} onChange={(v) => onChange('size', v)} />
      </div>

      {showLocationFields && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-xs font-semibold text-amber-700">
            Não encontramos sua localização — ela será usada neste anúncio e salva no seu perfil.
          </p>

          {/* 🆕 */}
          <CepField cep={cep} status={cepStatus} errorMessage={cepError} onChange={handleCepChange} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Cidade"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="Preenchido automaticamente pelo CEP"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select
                value={formData.state}
                onChange={(e) => onChange('state', e.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((uf) => <option key={uf.value} value={uf.value}>{uf.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StepBasicInfo