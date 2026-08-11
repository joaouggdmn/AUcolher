import { forwardRef, useImperativeHandle } from 'react'
import PetSwipeCard from './PetSwipeCard'
import { useDraggableCard } from '../hooks/useDraggableCard'

const PetCardStack = forwardRef(function PetCardStack({ pets, onSwipeLeft, onSwipeRight }, ref) {
  const { bind, dragX, rotation, isDragging, dragDirection, labelOpacity, triggerLike, triggerPass } =
    useDraggableCard({ onSwipeLeft, onSwipeRight })

  // Expõe os "gatilhos" de swipe para os botões externos (fora do card) usarem
  useImperativeHandle(ref, () => ({ triggerLike, triggerPass }))

  return (
    <div className="relative h-full w-full">
      {pets.slice(0, 3).map((pet, stackIndex) => (
        <PetSwipeCard
          key={pet.id}
          pet={pet}
          isFront={stackIndex === 0}
          stackIndex={stackIndex}
          dragBind={bind}
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