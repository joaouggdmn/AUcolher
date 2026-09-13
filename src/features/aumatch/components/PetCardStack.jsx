import { forwardRef, useImperativeHandle } from 'react'
import PetSwipeCard from './PetSwipeCard'
import { useDraggableCard } from '../hooks/useDraggableCard'

const PetCardStack = forwardRef(function PetCardStack(
  { pets, onSwipeLeft, onSwipeRight, isInteractionAllowed = true, onBlockedInteraction },
  ref
) {
  const { bind, dragX, rotation, isDragging, dragDirection, labelOpacity, triggerLike, triggerPass } =
    useDraggableCard({ onSwipeLeft, onSwipeRight })

  // Ponto único de guarda: tanto os botões (via ref) quanto o gesto de
  // arrastar (via dragBind, logo abaixo) passam por aqui. Uma só checagem
  // cobre os dois caminhos de interação — nenhuma duplicação de lógica.
  useImperativeHandle(ref, () => ({
    triggerLike: () => {
      if (!isInteractionAllowed) {
        onBlockedInteraction?.()
        return
      }
      triggerLike()
    },
    triggerPass: () => {
      if (!isInteractionAllowed) {
        onBlockedInteraction?.()
        return
      }
      triggerPass()
    },
  }))

  // Enquanto a interação não é permitida, o gesto de arrastar nem chega a
  // iniciar — evita que o card comece a se mover para só depois descobrir
  // que a ação será bloqueada (nenhum "voa e volta" estranho)
  const interactionBind = isInteractionAllowed
    ? bind
    : {
        onMouseDown: (e) => {
          e.preventDefault()
          onBlockedInteraction?.()
        },
        onTouchStart: () => onBlockedInteraction?.(),
      }

  return (
    <div className="relative h-full w-full">
      {pets.slice(0, 3).map((pet, stackIndex) => (
        <PetSwipeCard
          key={pet.id}
          pet={pet}
          isFront={stackIndex === 0}
          stackIndex={stackIndex}
          dragBind={interactionBind}
          dragX={dragX}
          rotation={rotation}
          isDragging={isDragging}
          dragDirection={dragDirection}
          labelOpacity={labelOpacity}
        />
      ))}
    </div>
  )
})

export default PetCardStack