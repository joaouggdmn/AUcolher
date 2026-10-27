import { useState } from 'react'
import { FaFlask, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import { getErrorMessage } from '../../../core/utils/apiError'
import { generateAdminDemoData, isAdminDemoActive, removeAdminDemoData } from './adminDemoData'

const ACTIONS = {
  generate: {
    run: generateAdminDemoData,
    icon: FaWandMagicSparkles,
    title: 'Gerar dados de teste?',
    description:
      'Cria no navegador campanhas encerradas com doações, espalhadas nos últimos 6 meses, para os gráficos de arrecadação terem o que mostrar. Contas, animais e adoções já vêm do banco. Nada vai para o banco. Se já houver dados de teste, eles são refeitos sem duplicar. A página recarrega no fim.',
    confirmLabel: 'Gerar dados',
  },
  remove: {
    run: removeAdminDemoData,
    icon: FaTrashCan,
    variant: 'danger',
    title: 'Apagar dados de teste?',
    description:
      'As campanhas e doações de teste do painel do admin saem do navegador. Os dados de teste do painel da ONG continuam como estão.',
    confirmLabel: 'Apagar dados',
  },
}

// Só aparece em `npm run dev` (AdminOverviewPage) e nunca na impressão
function AdminDemoDataCard() {
  const [pendingAction, setPendingAction] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const isActive = isAdminDemoActive()

  const action = pendingAction ? ACTIONS[pendingAction] : null

  async function handleConfirm() {
    setError(null)
    setProgress('Começando...')
    try {
      await action.run(setProgress)
      window.location.reload()
    } catch (err) {
      setError(getErrorMessage(err))
      setProgress(null)
    }
  }

  function handleCancel() {
    setPendingAction(null)
    setError(null)
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div>
        <p className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
          <FaFlask size={13} />
          Dados de teste
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-900">
            só em dev
          </span>
        </p>
        <p className="mt-1 max-w-xl text-xs text-amber-900/70">
          {isActive
            ? 'O painel está com dados de teste: campanhas e doações espalhadas nos últimos 6 meses.'
            : 'Preenche os gráficos de arrecadação com campanhas e doações de exemplo nos últimos 6 meses.'}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {isActive && (
          <button
            type="button"
            onClick={() => setPendingAction('remove')}
            className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition-colors duration-300 hover:bg-amber-100"
          >
            Apagar dados de teste
          </button>
        )}
        <button
          type="button"
          onClick={() => setPendingAction('generate')}
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-emerald-950 transition-colors duration-300 hover:bg-amber-400"
        >
          {isActive ? 'Gerar de novo' : 'Gerar dados de teste'}
        </button>
      </div>

      {action && (
        <ConfirmDialog
          icon={action.icon}
          variant={action.variant}
          title={action.title}
          description={action.description}
          confirmLabel={action.confirmLabel}
          processingLabel={progress}
          isProcessing={progress != null}
          error={error}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </section>
  )
}

export default AdminDemoDataCard
