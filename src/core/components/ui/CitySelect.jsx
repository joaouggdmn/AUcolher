import { useCities } from '../../hooks/useCities'
import { normalizeSearch } from '../../utils/search'

const SELECT_CLASS =
  'min-h-12 w-full rounded-control border border-line-strong bg-white px-4 text-sm text-ink-900 outline-none transition-colors duration-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-500'

// Cidade escolhida na lista do IBGE da UF, com a grafia oficial: o mesmo
// município nunca aparece escrito de dois jeitos ("Criciuma" e "Criciúma")
// no filtro de cidades. `onChange` recebe o nome da cidade.
// Cidade já salva com outra grafia continua selecionada pela versão oficial
// da lista, sem alterar nada até a pessoa mexer no campo. Se a lista do IBGE
// não carregar, vira um campo de texto, para ninguém ficar travado
function CitySelect({ id, state, city, onChange, required = false, label = 'Cidade', fallbackPlaceholder = 'Digite a cidade' }) {
  const { data: cities = [], isLoading, isError } = useCities(state)

  const officialCity = cities.find((name) => normalizeSearch(name) === normalizeSearch(city))
  const hasUnlistedCity = Boolean(city) && !officialCity && !isLoading && !isError

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-700">
        {label}
      </label>

      {isError ? (
        <>
          <input
            id={id}
            value={city ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={fallbackPlaceholder}
            required={required}
            className={SELECT_CLASS}
          />
          <p className="text-xs text-ink-500">Não conseguimos carregar a lista de cidades agora.</p>
        </>
      ) : (
        <select
          id={id}
          value={officialCity ?? city ?? ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={!state || isLoading}
          required={required}
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
      )}
    </div>
  )
}

export default CitySelect
