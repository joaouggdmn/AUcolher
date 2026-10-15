import { useMemo, useSyncExternalStore } from 'react'
import { getReturnsSnapshot, readReturnsData, subscribeReturns } from '../services/returnsMock'

// Registros de retorno e repasse do modo mock, sempre em dia: um registro
// feito nesta aba ou em outra muda as telas na hora. Sem o mock, vem vazio
// (a própria API já devolve os pedidos com RETURNED/REHOMED)
export function useReturnsMock() {
  const snapshot = useSyncExternalStore(subscribeReturns, getReturnsSnapshot)
  return useMemo(() => (snapshot == null ? { records: [], frozenScores: [] } : readReturnsData()), [snapshot])
}
