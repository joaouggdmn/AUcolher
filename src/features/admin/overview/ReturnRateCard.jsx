import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import { RETURN_REASON_LABELS } from '../../adocao/utils/requestStatus'

const RANGE_LABELS = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
}

function formatRate(rate) {
  return rate == null ? '—' : `${rate.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

// Taxa de reabandono (regras §3.3): quantas adoções voltaram ao doador ou
// foram repassadas pelo adotante, no geral e por faixa do score do AUmatch
// congelado na conclusão — a métrica que testa a hipótese do TCC. As faixas
// usam um tom só (é a mesma medida em três grupos) e a escala vai de 0 a
// 100%, para a barra de cada faixa ser comparável à das outras
function ReturnRateCard({ returns }) {
  if (!returns) return null

  const rangeItems = returns.byRange.map((range) => ({
    key: range.range,
    label: `${RANGE_LABELS[range.range]} (${range.min} a ${range.max})`,
    value: range.rate ?? 0,
    valueText: formatRate(range.rate),
    note: `${range.returns} de ${range.adoptions} ${plural(range.adoptions, 'adoção', 'adoções')}`,
    colorClass: 'bg-sky-600',
  }))

  const reasonItems = Object.entries(returns.byReason)
    .map(([reason, count]) => ({
      key: reason,
      label: RETURN_REASON_LABELS[reason] ?? reason,
      value: count,
      colorClass: 'bg-slate-400',
    }))
    .sort((a, b) => b.value - a.value)
  const totalReturns = returns.returned + returns.rehomed

  return (
    <ChartCard
      title="Taxa de reabandono"
      subtitle="Adoções que voltaram para quem doou ou foram repassadas pelo adotante (sem os resgates feitos por ONGs)"
    >
      {returns.isSample && (
        <p className="w-fit rounded-full border border-dashed border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
          Dados de exemplo: ainda há poucas adoções na plataforma para calcular a taxa
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(10rem,auto)_1fr_1fr] print:grid-cols-[minmax(10rem,auto)_1fr_1fr]">
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-black tracking-tight text-emerald-950">{formatRate(returns.rate)}</span>
          <span className="text-sm font-semibold text-slate-500">
            {totalReturns} de {returns.adoptions} {plural(returns.adoptions, 'adoção', 'adoções')}
          </span>
          <span className="mt-2 text-xs text-slate-500">
            {returns.returned} {plural(returns.returned, 'devolvida', 'devolvidas')} ao doador ·{' '}
            {returns.rehomed} {plural(returns.rehomed, 'repassada', 'repassadas')} pelo adotante
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Por compatibilidade no AUmatch</p>
          <BarList items={rangeItems} scaleMax={100} />
          <p className="text-[11px] text-slate-400">
            Sem score (quiz incompleto ou adoção antiga): {returns.noScore.returns} de {returns.noScore.adoptions}{' '}
            {plural(returns.noScore.adoptions, 'adoção', 'adoções')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Motivos</p>
          {totalReturns > 0 ? (
            <BarList items={reasonItems} />
          ) : (
            <p className="text-xs text-slate-400">Nenhum retorno ou repasse registrado.</p>
          )}
        </div>
      </div>

      <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        Considera só retornos e repasses registrados na plataforma.
      </p>
    </ChartCard>
  )
}

export default ReturnRateCard
