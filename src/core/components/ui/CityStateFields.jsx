import { BRAZILIAN_STATES } from '../../utils/brazilianStates'
import { useCities } from '../../hooks/useCities'
import FormField from './FormField'

const SELECT_CLASS =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

// Estado e cidade escolhidos em listas: a cidade vem do IBGE com a grafia
// oficial, então o mesmo município nunca aparece escrito de dois jeitos.
// `onChange` recebe um patch ({ state, city }): trocar o estado limpa a
// cidade, que pertencia ao estado anterior.
// Cidade já salva com outra grafia ("Criciuma") continua selecionada pela
// versão oficial da lista, sem alterar nada até a pessoa mexer no campo
function CityStateFields({ state, city, onChange }) {
  const { data: cities = [], isLoading, isError } = useCities(state)

  const officialCity = cities.find((name) => normalize(name) === normalize(city ?? ''))
  const hasUnlistedCity = Boolean(city) && !officialCity && !isLoading && !isError

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

      {/* Se a lista do IBGE não carregar, a pessoa não fica travada: digita a cidade */}
      {isError ? (
        <FormField
          label="Cidade"
          value={city ?? ''}
          onChange={(event) => onChange({ city: event.target.value })}
          placeholder="Digite a sua cidade"
          hint="Não conseguimos carregar a lista de cidades agora."
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="location-city" className="text-sm font-semibold text-slate-700">
            Cidade
          </label>
          <select
            id="location-city"
            value={officialCity ?? city ?? ''}
            onChange={(event) => onChange({ city: event.target.value })}
            disabled={!state || isLoading}
            className={SELECT_CLASS}
          >
            <option value="">
              {!state ? 'Escolha o estado primeiro' : isLoading ? 'Carregando cidades...' : 'Selecione'}
            </option>
            {hasUnlistedCity && <option value={city}>{city}</option>}
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default CityStateFields
