import { useMemo, useState } from 'react'
import { FaBan, FaBoxArchive, FaFlag } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ConfirmDialog from '../../../core/components/ui/ConfirmDialog'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import { getErrorMessage } from '../../../core/utils/apiError'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'
import ReportCaseCard from '../components/ReportCaseCard'
import { useAdminReports, useBanReportedAccount, useDismissReports } from '../hooks/useAdmin'
import { useAdminPanel } from '../panel/useAdminPanel'
import { banDescription } from '../utils/moderationText'
import { byPriority, byResolvedAt, groupReportsIntoCases, reportedAccount } from '../utils/reportCases'

const NO_REPORTS = []

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

function countWhere(items, predicate) {
  return items.filter(predicate).length
}

// "A denúncia contra Rex sai dos pendentes" / "As 3 denúncias contra Rex saem..."
function dismissDescription(reportCase) {
  const count = reportCase.reports.length
  const subject = count === 1 ? 'A denúncia' : `As ${count} denúncias`
  return `${subject} contra ${reportCase.target.name} ${count === 1 ? 'sai' : 'saem'} dos pendentes sem punir ninguém. Use quando o caso não procede.`
}

function AdminReportsPage() {
  const { data: reports = NO_REPORTS, isLoading, error, refetch } = useAdminReports()
  const { notify } = useAdminPanel()
  const dismissReports = useDismissReports()
  const banAccount = useBanReportedAccount()
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [typeFilter, setTypeFilter] = useState('')
  // Caso esperando a confirmação de uma decisão: { action, reportCase }
  const [confirming, setConfirming] = useState(null)

  const cases = useMemo(() => groupReportsIntoCases(reports), [reports])

  function askConfirmation(action, reportCase) {
    dismissReports.reset()
    banAccount.reset()
    setConfirming({ action, reportCase })
  }

  function handleBan() {
    const { reportCase } = confirming
    banAccount.mutate(reportCase, {
      onSuccess: () => {
        setConfirming(null)
        notify('Conta banida.')
      },
    })
  }

  function handleDismiss() {
    const { reportCase } = confirming
    dismissReports.mutate(reportCase.reports[0].id, {
      onSuccess: () => {
        setConfirming(null)
        notify(reportCase.reports.length === 1 ? 'Denúncia arquivada.' : 'Denúncias arquivadas.')
      },
    })
  }

  // Perfil: banir a conta. Anúncio: banir quem anunciou
  function actionsFor(reportCase) {
    if (!reportCase.isPending) return []
    return [
      { label: 'Arquivar', icon: FaBoxArchive, onClick: () => askConfirmation('dismiss', reportCase) },
      {
        label: reportCase.targetType === 'USER' ? 'Banir conta' : 'Banir quem anunciou',
        icon: FaBan,
        variant: 'danger',
        onClick: () => askConfirmation('ban', reportCase),
      },
    ]
  }

  let content
  if (isLoading) {
    content = <Spinner />
  } else if (error) {
    content = (
      <LoadErrorState title="Não foi possível carregar as denúncias" message={getErrorMessage(error)} onRetry={refetch} />
    )
  } else {
    const pending = cases.filter((reportCase) => reportCase.isPending).sort(byPriority)
    const resolved = cases.filter((reportCase) => !reportCase.isPending).sort(byResolvedAt)
    const byStatus = statusFilter === 'PENDING' ? pending : resolved
    const filtered = byStatus.filter((reportCase) => !typeFilter || reportCase.targetType === typeFilter)

    const statusOptions = [
      { value: 'PENDING', label: `Pendentes (${pending.length})` },
      { value: 'RESOLVED', label: `Julgadas (${resolved.length})` },
    ]
    const typeOptions = [
      { value: '', label: 'Tudo' },
      { value: 'ANIMAL', label: `Anúncios (${countWhere(byStatus, (item) => item.targetType === 'ANIMAL')})` },
      { value: 'USER', label: `Perfis (${countWhere(byStatus, (item) => item.targetType === 'USER')})` },
    ]

    content = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <PillToggleGroup options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
          <PillToggleGroup options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
        </div>

        {filtered.length === 0 ? (
          <ActivityEmptyState
            icon={FaFlag}
            title={statusFilter === 'PENDING' ? 'Nenhuma denúncia pendente.' : 'Nenhum caso julgado ainda.'}
            description={
              statusFilter === 'PENDING'
                ? 'Quando alguém denunciar um anúncio ou um perfil, o caso aparece aqui.'
                : 'Os casos arquivados ou punidos ficam aqui como histórico.'
            }
          />
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-400">
              {filtered.length} {plural(filtered.length, 'caso', 'casos')} ·{' '}
              {statusFilter === 'PENDING' ? 'mais denunciados primeiro' : 'julgados mais recentes primeiro'}
            </p>
            <ul className="flex flex-col gap-4">
              {filtered.map((reportCase) => (
                <ReportCaseCard key={reportCase.key} reportCase={reportCase} actions={actionsFor(reportCase)} />
              ))}
            </ul>
          </>
        )}
      </div>
    )
  }

  return (
    <PanelPage
      title="Denúncias"
      description="O que pessoas e ONGs denunciaram, agrupado por anúncio ou perfil. Julgar um caso resolve todas as denúncias dele."
    >
      {content}

      {confirming?.action === 'dismiss' && (
        <ConfirmDialog
          icon={FaBoxArchive}
          title={confirming.reportCase.reports.length === 1 ? 'Arquivar a denúncia?' : 'Arquivar as denúncias?'}
          description={dismissDescription(confirming.reportCase)}
          confirmLabel="Arquivar"
          processingLabel="Arquivando..."
          isProcessing={dismissReports.isPending}
          error={dismissReports.isError ? getErrorMessage(dismissReports.error) : null}
          onConfirm={handleDismiss}
          onCancel={() => setConfirming(null)}
        />
      )}

      {confirming?.action === 'ban' && (
        <ConfirmDialog
          icon={FaBan}
          variant="danger"
          title={`Banir ${reportedAccount(confirming.reportCase).name}?`}
          description={banDescription(
            reportedAccount(confirming.reportCase).name,
            confirming.reportCase.targetType === 'USER'
              ? confirming.reportCase.target.userType
              : confirming.reportCase.target.ownerUserType
          )}
          confirmLabel="Banir conta"
          processingLabel="Banindo..."
          isProcessing={banAccount.isPending}
          error={banAccount.isError ? getErrorMessage(banAccount.error) : null}
          onConfirm={handleBan}
          onCancel={() => setConfirming(null)}
        />
      )}
    </PanelPage>
  )
}

export default AdminReportsPage
