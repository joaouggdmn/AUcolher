import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// O react-router não rola até âncoras sozinho: sem isto, o link
// "Como funciona o match" do rodapé (/#match) só abria o topo da home
export function useScrollToHash() {
  const { hash, key } = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return

    // Um frame de espera: a seção precisa estar montada e com altura final.
    // 'instant' (e não 'auto'): o html tem scroll-smooth global, que o
    // 'auto' herdaria mesmo com movimento reduzido
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, key, prefersReducedMotion])
}
