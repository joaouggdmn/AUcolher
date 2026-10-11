import { reportTargetKey } from '../../denuncias/utils/reportRules'

// Como cada caso foi julgado, com rótulo e cor da etiqueta
export const RESOLUTION_META = {
  LISTING_REMOVED: { label: 'Anúncio removido', className: 'bg-rose-50 text-rose-600' },
  ACCOUNT_BANNED: { label: 'Conta banida', className: 'bg-rose-50 text-rose-600' },
  DISMISSED: { label: 'Arquivada', className: 'bg-slate-100 text-slate-500' },
}

function byNewest(field) {
  return (a, b) => (b[field] ?? '').localeCompare(a[field] ?? '')
}

function countReasons(reports) {
  const counts = new Map()
  for (const report of reports) counts.set(report.reason, (counts.get(report.reason) ?? 0) + 1)
  return [...counts.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count)
}

// Denúncias agrupadas em "casos", que é o que o admin julga. As pendentes de
// um mesmo alvo formam um caso só (julgar resolve todas juntas); as já
// julgadas, um caso por decisão (mesmo alvo, resolução e momento)
export function groupReportsIntoCases(reports) {
  const cases = new Map()

  for (const report of reports) {
    const targetKey = reportTargetKey(report)
    const key = report.isPending ? `${targetKey}|PENDING` : `${targetKey}|${report.resolution}|${report.resolvedAt}`
    if (!cases.has(key)) {
      cases.set(key, {
        key,
        targetType: report.targetType,
        targetId: report.targetId,
        isPending: report.isPending,
        resolution: report.resolution,
        resolvedAt: report.resolvedAt,
        reports: [],
      })
    }
    cases.get(key).reports.push(report)
  }

  return [...cases.values()].map((reportCase) => {
    const sorted = [...reportCase.reports].sort(byNewest('createdAt'))
    return {
      ...reportCase,
      reports: sorted,
      // A cópia mais recente do alvo (nome e foto podem ter mudado)
      target: sorted[0].target,
      lastReportAt: sorted[0].createdAt,
      reasonCounts: countReasons(sorted),
    }
  })
}

// Pendentes: os mais denunciados primeiro, depois o mais recente
export function byPriority(a, b) {
  return b.reports.length - a.reports.length || (b.lastReportAt ?? '').localeCompare(a.lastReportAt ?? '')
}

export function byResolvedAt(a, b) {
  return (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? '')
}

// A conta que um banimento atinge: a do perfil denunciado ou a dona do anúncio
export function reportedAccount(reportCase) {
  const { target } = reportCase
  if (reportCase.targetType === 'USER') return { id: reportCase.targetId, name: target.name, userType: target.userType }
  return { id: target.ownerId, name: target.ownerName, userType: target.ownerUserType }
}

// Badge da barra lateral: quantos alvos esperam uma decisão
export function countPendingCases(reports) {
  return new Set(reports.filter((report) => report.isPending).map(reportTargetKey)).size
}
