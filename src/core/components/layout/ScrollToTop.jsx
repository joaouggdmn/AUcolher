import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Onde a pessoa estava em cada entrada do histórico (location.key → scrollY).
// Vive enquanto a aba estiver aberta, que é o que o voltar precisa
const savedPositions = new Map()

// Quantos quadros insistir ao voltar para uma página que ainda está montando
// a lista (sem altura suficiente para chegar ao ponto salvo)
const RESTORE_MAX_FRAMES = 30

// O react-router mantém a rolagem da página anterior: sem isto, quem está no
// fim de /animais e clica em Eventos abre /eventos lá embaixo. Então:
// - página nova (pathname novo): volta ao topo;
// - voltar/avançar do navegador (POP): volta para onde a pessoa estava;
// - com #âncora, quem rola é o useScrollToHash da página;
// - trocar só a busca (?search=, filtros) não conta como página nova.
// Sempre 'instant': o html tem scroll-smooth global, e a tela deslizaria.
// O painel da ONG e o admin rolam a própria área de conteúdo (PanelShell)
function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()

  // Layout effect: troca a chave no mesmo commit da página nova, antes de
  // qualquer evento de rolagem dela ser salvo na entrada anterior
  useLayoutEffect(() => {
    let frame = 0
    const save = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => savedPositions.set(key, window.scrollY))
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', save)
    }
  }, [key])

  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      // Primeira carga ou recarregar: o navegador cuida
      if (!savedPositions.has(key)) return
      const target = savedPositions.get(key)
      let frame = 0
      let tries = 0
      const restore = () => {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' })
        if (Math.abs(window.scrollY - target) > 1 && tries++ < RESTORE_MAX_FRAMES) {
          frame = requestAnimationFrame(restore)
        }
      }
      restore()
      return () => cancelAnimationFrame(frame)
    }

    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Só o pathname dispara: hash, key e tipo de navegação são lidos do momento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}

export default ScrollToTop
