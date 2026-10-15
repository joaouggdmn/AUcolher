import { FaPen, FaRotateLeft } from 'react-icons/fa6'
import { ACTION_CLASSES } from '../../../animais/components/owner/OwnerAnimalRow'

// Ação da linha do animal para o doador: "Animal retornado" numa adoção
// concluída, "Corrigir retorno" depois de registrado. No repasse não há
// ação: o animal está com o adotante
function OwnerReturnButton({ request, onOpen }) {
  if (request.status === 'CONCLUDED') {
    return (
      <button
        type="button"
        onClick={() => onOpen(request)}
        className={`${ACTION_CLASSES} border-sky-200 text-sky-700 hover:bg-sky-50`}
      >
        <FaRotateLeft size={10} />
        Animal retornado
      </button>
    )
  }
  if (request.status === 'RETURNED') {
    return (
      <button
        type="button"
        onClick={() => onOpen(request)}
        className={`${ACTION_CLASSES} border-slate-200 text-slate-600 hover:bg-slate-50`}
      >
        <FaPen size={10} />
        Corrigir retorno
      </button>
    )
  }
  return null
}

export default OwnerReturnButton
