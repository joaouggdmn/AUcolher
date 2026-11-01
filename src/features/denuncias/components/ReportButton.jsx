import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFlag } from 'react-icons/fa6'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useAuth } from '../../../core/context/AuthContext'
import { isSameId } from '../../../core/utils/ids'
import { useMyReports } from '../hooks/useDenuncias'
import { reportTargetKey } from '../utils/reportRules'
import ReportModal from './ReportModal'

const LABELS = { ANIMAL: 'Denunciar anúncio', USER: 'Denunciar perfil' }

const VARIANT_CLASSES = {
  // Ao lado das redes sociais, no cabeçalho do perfil
  pill: 'flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-500 transition-all duration-300 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600',
  // Discreto, embaixo do botão de interesse do anúncio
  link: 'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-400 transition-colors duration-300 hover:text-rose-600',
}

const UNDER_REVIEW_CLASSES = {
  pill: 'flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-xs font-bold text-slate-500',
  link: 'flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-400',
}

// "Denunciar" de um anúncio (`targetType` ANIMAL, `target` = animal) ou de um
// perfil (USER, `target` = perfil público). Quem não entrou recebe o convite
// para logar; quem já tem uma denúncia em análise para o mesmo alvo vê
// "Denúncia em análise". Some no próprio conteúdo e para o admin, que modera
// direto pelo painel
function ReportButton({ targetType, target, variant = 'link' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: myReports = [] } = useMyReports()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const closeToast = useCallback(() => setSuccessMessage(null), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const ownerId = targetType === 'ANIMAL' ? target.ownerId : target.id
  if (user && (user.userType === 'ADMIN' || isSameId(ownerId, user.id))) return null

  const targetKey = reportTargetKey({ targetType, targetId: target.id, target })
  const isUnderReview = myReports.some((report) => report.isPending && reportTargetKey(report) === targetKey)

  function handleClick() {
    if (user) setIsModalOpen(true)
    else setIsAuthModalOpen(true)
  }

  function handleReported() {
    setIsModalOpen(false)
    setSuccessMessage('Denúncia enviada. A equipe do AUcolher vai analisar.')
  }

  return (
    <>
      {isUnderReview ? (
        <span className={UNDER_REVIEW_CLASSES[variant]} title="Você já denunciou. A equipe do AUcolher está analisando.">
          <FaFlag size={11} />
          Denúncia em análise
        </span>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label={LABELS[targetType]}
          className={VARIANT_CLASSES[variant]}
        >
          <FaFlag size={11} />
          {variant === 'pill' ? 'Denunciar' : LABELS[targetType]}
        </button>
      )}

      {isModalOpen && (
        <ReportModal targetType={targetType} target={target} onClose={closeModal} onReported={handleReported} />
      )}

      {isAuthModalOpen &&
        createPortal(
          <AuthRequiredModal
            message="Para denunciar, entre na sua conta: assim a denúncia fica registrada para a equipe analisar."
            onCancel={() => setIsAuthModalOpen(false)}
            onLogin={() => navigate('/login', { state: { from: location } })}
          />,
          document.body
        )}

      {createPortal(<SuccessToast message={successMessage} onClose={closeToast} />, document.body)}
    </>
  )
}

export default ReportButton
