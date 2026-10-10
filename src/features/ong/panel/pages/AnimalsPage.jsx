import { FaPlus } from 'react-icons/fa6'
import OngAnimalsPanel from '../../components/dashboard/OngAnimalsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function AnimalsPage() {
  const { dashboard } = useOngPanel()
  const { animals, queries } = dashboard

  return (
    <PanelPage
      title="Animais"
      description='Os disponíveis aparecem na vitrine e no perfil da ONG. "Em processo" já tem uma adoção encaminhada; os adotados ficam como histórico.'
      actions={[{ to: '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }]}
    >
      <OngAnimalsPanel
        animals={animals}
        isLoading={queries.animals.isLoading}
        error={queries.animals.error}
        onRetry={() => queries.animals.refetch()}
      />
    </PanelPage>
  )
}

export default AnimalsPage
