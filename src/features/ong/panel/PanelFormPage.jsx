import { FaArrowLeft } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'

// Moldura dos formulários do painel (animal, evento, campanha) e da edição
// do admin: título, botão de voltar para a lista e o conteúdo numa coluna de
// leitura confortável, centralizada na área ao lado da nav. 52rem = os 48rem
// do formulário + o padding lateral do PanelPage
function PanelFormPage({ title, description, backTo, backLabel, children }) {
  return (
    <PanelPage
      title={title}
      description={description}
      actions={[{ to: backTo, label: backLabel, icon: FaArrowLeft }]}
      framed={false}
      widthClass="max-w-[52rem]"
    >
      {children}
    </PanelPage>
  )
}

export default PanelFormPage
