import { BRAZILIAN_STATES } from '../../utils/brazilianStates'
import CitySelect from './CitySelect'

const SELECT_CLASS =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

// Estado e cidade escolhidos em listas: a cidade vem do IBGE com a grafia
// oficial (CitySelect), então o mesmo município nunca aparece escrito de dois
// jeitos. `onChange` recebe um patch ({ state, city }): trocar o estado limpa
// a cidade, que pertencia ao estado anterior
function CityStateFields({ state, city, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location-state" className="text-sm font-semibold text-slate-700">
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
