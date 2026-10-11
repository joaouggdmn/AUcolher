import { useMemo, useState } from 'react'
import { FaPaw } from 'react-icons/fa6'
import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import PanelPage from '../../../core/components/panel/PanelPage'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import Spinner from '../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { matchesSearch } from '../../../core/utils/search'
import SearchBar from '../../animais/components/SearchBar'
import { LISTING_STATUS_META } from '../../animais/utils/listingStatus'
import AnimalStatusChart from '../../ong/components/dashboard/charts/AnimalStatusChart'
import { animalStatusSegments, speciesBars } from '../../ong/utils/panelCharts'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'
import AdminAnimalRow from '../components/AdminAnimalRow'
import { useAdminAnimals } from '../hooks/useAdmin'
import { withPlatformAdoptionStatus } from '../utils/platformAnimals'

const PAGE_SIZE = 20
const NO_ANIMALS = []

const SPECIES_FILTERS = [
  { value: 'DOG', label: 'Cães' },
  { value: 'CAT', label: 'Gatos' },
  { value: 'OTHER', label: 'Outros' },
]

function AdminAnimalsPage() {
  const { data: apiAnimals = NO_ANIMALS, isLoading, error, refetch } = useAdminAnimals()
  const { requests } = useAdoptionRequests()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Anúncio de conta banida está fora do site: conta como "Fora do ar", como
  // na Visão geral (a etiqueta "Conta banida" na linha explica o motivo)
  const animals = useMemo(
    () =>
      withPlatformAdoptionStatus(apiAnimals, requests).map((animal) =>
        animal.ownerIsBanned && animal.listingStatus !== 'ADOPTED' ? { ...animal, listingStatus: 'INACTIVE' } : animal
      ),
    [apiAnimals, requests]
  )

  // Filtro novo, lista do começo
  function withReset(setter) {
    return (value) => {
      setter(value)
      setVisibleCount(PAGE_SIZE)
    }
  }

  let content
  if (isLoading) {
    content = <Spinner />
  } else if (error) {
    content = (
      <LoadErrorState title="Não foi possível carregar os animais" message={getErrorMessage(error)} onRetry={refetch} />
    )
  } else if (animals.length === 0) {
    content = (
      <ActivityEmptyState
        icon={FaPaw}
        title="Nenhum animal anunciado ainda."
        description="Os anúncios de pessoas e ONGs aparecem aqui, com a situação de cada um."
      />
    )
  } else {
    const statusOptions = [
      { value: '', label: `Todos (${animals.length})` },
      ...animalStatusSegments(animals)
        .filter((segment) => segment.value > 0)
        .map((segment) => ({ value: segment.key, label: `${LISTING_STATUS_META[segment.key].label} (${segment.value})` })),
    ]
    const speciesOptions = [
      { value: '', label: 'Todas as espécies' },
      ...SPECIES_FILTERS.map((option) => ({
        ...option,
        count: animals.filter((animal) => animal.species === option.value).length,
      }))
        .filter((option) => option.count > 0)
        .map(({ value, label, count }) => ({ value, label: `${label} (${count})` })),
    ]

    const filtered = animals
      .filter((animal) => !statusFilter || animal.listingStatus === statusFilter)
      .filter((animal) => !speciesFilter || animal.species === speciesFilter)
      .filter((animal) => matchesSearch(search, animal.name, animal.breed, animal.ownerName, animal.city))
    const visible = filtered.slice(0, visibleCount)

    content = (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <AnimalStatusChart animals={animals} />
          <ChartCard title="Por espécie">
            <BarList items={speciesBars(animals)} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <SearchBar
            value={search}
            onChange={withReset(setSearch)}
            placeholder="Buscar por nome, raça, quem anunciou ou cidade..."
          />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <PillToggleGroup options={statusOptions} value={statusFilter} onChange={withReset(setStatusFilter)} />
            <PillToggleGroup options={speciesOptions} value={speciesFilter} onChange={withReset(setSpeciesFilter)} />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhum animal encontrado com esses filtros.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {visible.map((animal) => (
                  <AdminAnimalRow key={animal.id} animal={animal} />
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <ShowMoreButton
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  remainingCount={filtered.length - visibleCount}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <PanelPage
      title="Animais"
      description='Todos os anúncios da plataforma. "Em processo" já tem uma adoção aceita a caminho da entrega; os adotados ficam como histórico.'
    >
      {content}
    </PanelPage>
  )
}

export default AdminAnimalsPage
