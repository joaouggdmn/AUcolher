// Ids chegam como número (banco) ou texto (params de rota)
export function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}
