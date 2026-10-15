import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEyeSlash, FaPen } from 'react-icons/fa6'
import { USE_MOCK_REABANDONO } from '../../../../core/utils/constants'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import { animalDisplayName } from '../../utils/requestAnimal'
import RegisterReturnModal from './RegisterReturnModal'

// O fluxo do "Animal retornado" para o doador, igual em "Meus animais" e no
// painel da ONG: a modal de registro e, num retorno novo, a escolha entre
// revisar o anúncio (para corrigir o comportamento conforme o motivo) ou
// deixá-lo fora do ar. `editTo(animalId)` é a edição de cada lado
function OwnerReturnDialogs({ request, editTo, onNotify, onClose }) {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState(false)
  const animalName = animalDisplayName(request.animal)

  const handleRegistered = (_updated, { isCorrection }) => {
    if (isCorrection) {
      onNotify(`Retorno de ${animalName} corrigido.`)
      onClose()
      return
    }
    onNotify('Retorno registrado.')
    setRegistered(true)
  }

  if (!registered) {
    return <RegisterReturnModal request={request} onClose={onClose} onRegistered={handleRegistered} />
  }

  // 🔴 No mock, a API ainda vê o animal como adotado e recusa a edição
  if (USE_MOCK_REABANDONO) {
    return (
      <ConfirmDialog
        icon={FaEyeSlash}
        title={`${animalName} está fora do ar`}
        description="O anúncio voltou para você e não aparece na vitrine. Modo de demonstração: editar e colocar de volta no ar libera quando o backend do retorno estiver pronto."
        confirmLabel="Entendi"
        cancelLabel="Fechar"
        onConfirm={onClose}
        onCancel={onClose}
      />
    )
  }

  return (
    <ConfirmDialog
      icon={FaPen}
      title={`${animalName} está fora do ar`}
      description="Quer revisar o anúncio agora? Dá para ajustar o comportamento conforme o motivo do retorno (por exemplo, “não convive com gatos”) e depois colocá-lo de volta no ar."
      confirmLabel="Revisar e republicar"
      cancelLabel="Deixar fora do ar"
      onConfirm={() => navigate(editTo(request.animalId))}
      onCancel={onClose}
    />
  )
}

export default OwnerReturnDialogs
