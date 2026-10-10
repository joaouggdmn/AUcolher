import { useEffect, useRef } from 'react'
import { useChangeAnimalStatus } from '../../features/animais/hooks/useAnimais'
import { isSameId } from '../utils/ids'

// 🔴 mock: quem conclui a adoção é o adotante, mas só o dono pode mudar o
// status do animal na API. Enquanto os pedidos vivem no localStorage, o
// animal vira ADOPTED quando o dono estiver logado. Com o backend de
// adoções, o próprio servidor faz isso na conclusão
export function useSyncAdoptedAnimals({ userId, requests, myAnimals }) {
  const { mutate: changeStatus } = useChangeAnimalStatus()
  // Uma tentativa por animal: se a API recusar, não fica repetindo a cada render
  const attemptedIds = useRef(new Set())

  useEffect(() => {
    if (userId == null) return
    const adoptedIds = new Set(
      requests
        .filter((r) => r.status === 'CONCLUDED' && r.animalSource === 'api' && isSameId(r.ownerId, userId))
        .map((r) => String(r.animalId))
    )

    for (const animal of myAnimals) {
      const id = String(animal.id)
      if (animal.status === 'ADOPTED' || !adoptedIds.has(id) || attemptedIds.current.has(id)) continue
      attemptedIds.current.add(id)
      changeStatus({ id: animal.id, status: 'ADOPTED' })
    }
  }, [userId, requests, myAnimals, changeStatus])
}
