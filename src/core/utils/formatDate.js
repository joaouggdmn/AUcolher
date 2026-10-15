// "2024-03-15" ou "2026-09-20T18:14:01.173" → 2024. Lê o ano direto do
// texto: new Date('2024-01-01') é meia-noite UTC, que no Brasil ainda é 2023
export function getYearFromIsoDate(isoDate) {
  const match = /^(\d{4})-/.exec(isoDate ?? '')
  return match ? Number(match[1]) : null
}

// "2026-11-03" ou "2026-11-03T18:20:00" → "03/11/2026". Só data vira meia-noite
// local (sem o "T", o Date leria como UTC e mostraria o dia anterior)
export function formatDateBr(isoDate) {
  if (!isoDate) return ''
  const date = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
