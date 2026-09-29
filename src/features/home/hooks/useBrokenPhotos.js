import { useSyncExternalStore } from 'react'

// Fotos que falharam ao carregar nesta sessão (ex.: link do Unsplash que
// saiu do ar). As vitrines da home tiram esses pets e puxam o próximo, em
// vez de exibir um card sem foto. Store de módulo: um erro visto no hero já
// vale para o simulador e para a vitrine
let brokenPhotos = new Set()
const listeners = new Set()

export function reportBrokenPhoto(url) {
  if (!url || brokenPhotos.has(url)) return
  brokenPhotos = new Set(brokenPhotos).add(url)
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => brokenPhotos

export function useBrokenPhotos() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
