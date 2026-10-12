import { useInView } from '../../../../core/hooks/useInView'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

// Mesmo efeito do RevealOnScroll do core, mas respeitando o
// prefers-reduced-motion: nesse caso o bloco já nasce visível
function HomeReveal({ children, className = '', delay = 0 }) {
  const [ref, isInView] = useInView()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isVisible = prefersReducedMotion || isInView

  return (
    <div
      ref={ref}
      className={`${prefersReducedMotion ? '' : 'transition-all duration-700 ease-out'} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={!prefersReducedMotion && isVisible ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default HomeReveal
