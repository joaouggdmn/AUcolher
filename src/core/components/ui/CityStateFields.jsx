import { BRAZILIAN_STATES } from '../../utils/brazilianStates'
import CitySelect from './CitySelect'

const SELECT_CLASS =
  'min-h-12 w-full rounded-control border border-line-strong bg-white px-4 text-sm text-ink-900 outline-none transition-colors duration-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-500'

// Estado e cidade escolhidos em listas: a cidade vem do IBGE com a grafia
// oficial (CitySelect), então o mesmo município nunca aparece escrito de dois
// jeitos. `onChange` recebe um patch ({ state, city }): trocar o estado limpa
// a cidade, que pertencia ao estado anterior
function CityStateFields({ state, city, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location-state" className="text-sm font-semibold text-ink-700">
          Estado
        </label>
        <select
          id="location-state"
          value={state ?? ''}
          onChange={(event) => onChange({ state: event.target.value, city: '' })}
          className={SELECT_CLASS}
        >
          <option value="">Selecione</option>
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf.value} value={uf.value}>
              {uf.label}
            </option>
          ))}
        </select>
      </div>

      <CitySelect
        id="location-city"
        state={state}
        city={city}
        onChange={(value) => onChange({ city: value })}
        fallbackPlaceholder="Digite a sua cidade"
      />
    </div>
  )
}

export default CityStateFields
