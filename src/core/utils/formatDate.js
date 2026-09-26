// "2024-03-15" ou "2026-09-20T18:14:01.173" → 2024. Lê o ano direto do
// texto: new Date('2024-01-01') é meia-noite UTC, que no Brasil ainda é 2023
export function getYearFromIsoDate(isoDate) {
  const match = /^(\d{4})-/.exec(isoDate ?? '')
  return match ? Number(match[1]) : null
}
