import { FaEye } from 'react-icons/fa6'
import { useAuth } from '../../../../core/context/AuthContext'
import PanelPage from '../../../../core/components/panel/PanelPage'
import OngAccountForm from '../../../perfil/components/account/OngAccountForm'
import ModeratedNote from '../../../../core/components/ui/ModeratedNote'

// O mesmo formulário de "Minha conta": com alterações pendentes, a barra de
// salvar fica fixa no rodapé e sair do painel pergunta antes
function ProfilePage() {
  const { user } = useAuth()

  return (
    <PanelPage
      title="Perfil da ONG"
      description="A vitrine pública da instituição e os dados de acesso. O que for público aparece no perfil da ONG depois de salvar."
      actions={[{ to: `/ong/${user?.id}`, label: 'Ver perfil público', icon: FaEye }]}
      framed={false}
    >
      {/* pb-24: espaço para a barra fixa de "alterações não salvas" */}
      <div className="max-w-4xl pb-24">
        {/* A moderação editou o perfil: a ONG fica sabendo aqui */}
        <ModeratedNote moderatedAt={user?.moderatedAt} size="md" className="mb-6" />
        {/* key: outra conta logando no mesmo navegador remonta o form com os dados dela */}
        <OngAccountForm key={user?.id} />
      </div>
    </PanelPage>
  )
}

export default ProfilePage
