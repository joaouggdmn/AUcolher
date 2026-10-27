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

// Uma linha: rótulo e valor em cima (o rótulo quebra linha se faltar
// espaço, o valor nunca), a barra embaixo ocupando a largura toda. Assim
// nada se sobrepõe, nem numa coluna estreita nem no PDF
function MeterList({ items, scaleMax }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-xs font-semibold text-slate-600">{item.label}</span>
            <span className="shrink-0 whitespace-nowrap text-xs font-bold text-emerald-950">
              {item.valueText ?? item.value}
              {item.note && <span className="font-normal text-slate-400"> · {item.note}</span>}
            </span>
          </div>
          <div aria-hidden="true" className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
            {item.value > 0 && (
              <div
                className={`h-full min-w-1 rounded-full ${item.colorClass}`}
                style={{ width: `${Math.min(item.value / scaleMax, 1) * 100}%` }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
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
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-black tracking-tight text-emerald-950">{formatRate(returns.rate)}</span>
        <span className="text-sm font-semibold text-slate-500">
          {totalReturns} de {returns.adoptions} {plural(returns.adoptions, 'adoção', 'adoções')}
        </span>
        <span className="basis-full text-xs text-slate-500">
          {returns.returned} {plural(returns.returned, 'devolvida', 'devolvidas')} ao doador ·{' '}
          {returns.rehomed} {plural(returns.rehomed, 'repassada', 'repassadas')} pelo adotante
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 lg:grid-cols-2 print:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Por compatibilidade no AUmatch</p>
          <MeterList items={rangeItems} scaleMax={100} />
          <p className="text-[11px] text-slate-400">
            Sem score (quiz incompleto ou adoção antiga): {returns.noScore.returns} de {returns.noScore.adoptions}{' '}
            {plural(returns.noScore.adoptions, 'adoção', 'adoções')}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Motivos</p>
          {totalReturns > 0 ? (
            <MeterList items={reasonItems} scaleMax={Math.max(...reasonItems.map((item) => item.value), 1)} />
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
