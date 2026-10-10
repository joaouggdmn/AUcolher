import { FaArrowLeft } from 'react-icons/fa6'
import PanelPage from './PanelPage'

// Moldura dos formulários do painel (animal, evento, campanha): título,
// botão de voltar para a lista e o conteúdo numa coluna de leitura confortável
function PanelFormPage({ title, description, backTo, backLabel, children }) {
  return (
    <PanelPage
      title={title}
      description={description}
      actions={[{ to: backTo, label: backLabel, icon: FaArrowLeft }]}
      framed={false}
    >
      <div className="max-w-3xl">{children}</div>
    </PanelPage>
  )
}

export default PanelFormPage
