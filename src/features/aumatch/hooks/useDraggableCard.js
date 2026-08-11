import { useCallback, useEffect, useRef, useState } from 'react'

const SWIPE_THRESHOLD = 120
const ROTATION_FACTOR = 0.05
const EXIT_DISTANCE = 700
const EXIT_DURATION = 300

export function useDraggableCard({ onSwipeLeft, onSwipeRight } = {}) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const dragXRef = useRef(0) // espelha dragX para leitura sem closure desatualizada

  useEffect(() => {
    dragXRef.current = dragX
  }, [dragX])

  const exitTo = useCallback(
    (direction) => {
      setIsDragging(false)
      setDragX(direction === 'right' ? EXIT_DISTANCE : -EXIT_DISTANCE)

      setTimeout(() => {
        if (direction === 'right') onSwipeRight?.()
        else onSwipeLeft?.()
        // Reset acontece no MESMO lote de atualização que o avanço de índice
        // no componente pai — assim o próximo card (mesma instância do hook,
        // já que o PetCardStack nunca desmonta) já nasce centralizado, em vez
        // de animar a partir da posição de saída do card anterior.
        setDragX(0)
      }, EXIT_DURATION)
    },
    [onSwipeLeft, onSwipeRight]
  )

  const finishDrag = useCallback(() => {
    const finalX = dragXRef.current
    if (finalX > SWIPE_THRESHOLD) exitTo('right')
    else if (finalX < -SWIPE_THRESHOLD) exitTo('left')
    else {
      setIsDragging(false)
      setDragX(0)
    }
  }, [exitTo])

  // Listeners de mouse ficam na window (não no card) durante o arraste —
  // assim o gesto continua funcionando mesmo se o cursor sair do card
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => setDragX(e.clientX - startXRef.current)
    const handleMouseUp = () => finishDrag()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, finishDrag])

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX
    setIsDragging(true)
  }

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    setDragX(e.touches[0].clientX - startXRef.current)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    finishDrag()
  }

  const bind = {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

  const rotation = dragX * ROTATION_FACTOR
  const dragDirection = dragX > 30 ? 'right' : dragX < -30 ? 'left' : null
  const labelOpacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)

  return {
    bind,
    dragX,
    rotation,
    isDragging,
    dragDirection,
    labelOpacity,
    triggerLike: () => exitTo('right'),
    triggerPass: () => exitTo('left'),
  }
}