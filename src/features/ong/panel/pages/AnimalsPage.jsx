import { useState } from 'react'
import { FaCircleCheck, FaPaw, FaPlus } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import SearchBar from '../../../animais/components/SearchBar'
import { useChangeAnimalStatus } from '../../../animais/hooks/useAnimais'
import { LISTING_STATUS_META } from '../../../animais/utils/listingStatus'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import AnimalStatusChart from '../../components/dashboard/charts/AnimalStatusChart'
import BarList from '../../components/dashboard/charts/BarList'
import ChartCard from '../../components/dashboard/charts/ChartCard'
import { animalStatusSegments, speciesBars } from '../../utils/panelCharts'
import AnimalRow from '../animals/AnimalRow'
import PanelPage from '../PanelPage'
import { PANEL_PATHS } from '../panelPaths'
import { useOngPanel } from '../useOngPanel'

const SUCCESS_MESSAGES = {
  AVAILABLE: ({ name }) => `${name} voltou para a vitrine.`,
  INACTIVE: ({ name }) => `${name} saiu do ar. Dá para colocar de volta quando quiser.`,
  ADOPTED: ({ name, sex }) => `Que notícia boa! ${name} foi ${sex === 'FEMALE' ? 'marcada como adotada' : 'marcado como adotado'}.`,
}

// Busca sem diferenciar acento nem maiúscula ("cafe" acha "Café")
function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function AnimalsPage() {
  const { dashboard, notify } = useOngPanel()
  const { animals, queries } = dashboard
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [adoptionCandidate, setAdoptionCandidate] = useState(null)
  const [statusError, setStatusError] = useState(null)
  const { mutate: changeStatus, isPending, variables } = useChangeAnimalStatus()

  const handleChangeStatus = (animal, status) => {
    setStatusError(null)
    changeStatus(
      { id: animal.id, status },
      {
        onSuccess: () => {
          setAdoptionCandidate(null)
          notify(SUCCESS_MESSAGES[status](animal))
        },
        onError: (error) => {
          setAdoptionCandidate(null)
          setStatusError(getErrorMessage(error))
        },
      }
    )
  }

  let content
  if (queries.animals.isLoading) {
    content = <Spinner />
  } else if (queries.animals.error) {
    content = (
      <LoadErrorState
        title="Não foi possível carregar os animais"
        message={getErrorMessage(queries.animals.error)}
        onRetry={() => queries.animals.refetch()}
      />
    )
  } else if (animals.length === 0) {
    content = (
      <ActivityEmptyState
        icon={FaPaw}
        title="Nenhum animal cadastrado ainda."
        description="Os animais que a ONG cadastrar aparecem aqui e, enquanto estiverem disponíveis, na vitrine e no perfil público."
        action={{ to: PANEL_PATHS.animalNew, label: 'Cadastrar animal', icon: FaPlus }}
      />
    )
  } else {
    const segments = animalStatusSegments(animals)
    const filterOptions = [
      { value: '', label: `Todos (${animals.length})` },
      ...segments
        .filter((segment) => segment.value > 0)
        .map((segment) => ({ value: segment.key, label: `${LISTING_STATUS_META[segment.key].label} (${segment.value})` })),
    ]
    const term = normalize(search.trim())
    const visible = animals
      .filter((animal) => !statusFilter || animal.listingStatus === statusFilter)
      .filter((animal) => !term || normalize(animal.name).includes(term))

    content = (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <AnimalStatusChart animals={animals} />
          <ChartCard title="Por espécie">
            <BarList items={speciesBars(animals)} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar pelo nome do animal..." />
          <PillToggleGroup options={filterOptions} value={statusFilter} onChange={setStatusFilter} />

          {statusError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
              {statusError}
            </p>
          )}

          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhum animal encontrado com esses filtros.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((animal) => (
                <AnimalRow
                  key={animal.id}
                  animal={animal}
                  pendingStatus={isPending && variables?.id === animal.id ? variables.status : null}
                  onChangeStatus={handleChangeStatus}
                  onMarkAdopted={setAdoptionCandidate}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  const adoptedWord = adoptionCandidate?.sex === 'FEMALE' ? 'adotada' : 'adotado'

  return (
    <PanelPage
      title="Animais"
      description='Os disponíveis aparecem na vitrine e no perfil da ONG. "Em processo" já tem uma adoção encaminhada; os adotados ficam como histórico.'
      actions={[{ to: PANEL_PATHS.animalNew, label: 'Cadastrar animal', icon: FaPlus }]}
    >
      {content}

      {adoptionCandidate && (
        <ConfirmDialog
          icon={FaCircleCheck}
          title={`${adoptionCandidate.name} foi ${adoptedWord}?`}
          description="Essa ação é definitiva: o anúncio sai da vitrine e do perfil público e não pode mais ser editado nem voltar ao ar."
          confirmLabel={`Sim, foi ${adoptedWord}`}
          processingLabel="Salvando..."
          isProcessing={isPending}
          onConfirm={() => handleChangeStatus(adoptionCandidate, 'ADOPTED')}
          onCancel={() => setAdoptionCandidate(null)}
        />
      )}
    </PanelPage>
  )
}

export default AnimalsPage
