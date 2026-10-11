import { useAuth } from '../../../core/context/AuthContext'
import { usePrintTimestamp } from '../../../core/hooks/usePrintTimestamp'
import { CHART_MONTHS } from '../../ong/utils/panelCharts'

function formatDateTime(date) {
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Topo do relatório em PDF, no lugar do título da página (PanelPage
// `printHeader`): só aparece na impressão
function PrintReportHeader() {
  const { user } = useAuth()
  const printedAt = usePrintTimestamp()

  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-emerald-900 pb-3">
      <div>
        <p className="text-2xl font-black tracking-tight">
          <span className="text-emerald-950">AU</span>
          <span className="text-amber-500">colher</span>
        </p>
        <p className="text-sm font-bold text-emerald-950">Relatório da plataforma · Visão geral</p>
      </div>
      <div className="text-right text-xs text-slate-500">
        {printedAt && <p>Gerado em {formatDateTime(printedAt)}</p>}
        {user?.name && <p>Por {user.name}</p>}
        <p>Gráficos mensais: últimos {CHART_MONTHS} meses</p>
      </div>
    </div>
  )
}

export default PrintReportHeader
