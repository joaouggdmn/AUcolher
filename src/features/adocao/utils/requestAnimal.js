const MISSING_ANIMAL_NAME = 'Animal não encontrado'

// Nome do animal de um pedido para exibir (cards, chat, avisos)
export function animalDisplayName(animal) {
  return animal?.name ?? MISSING_ANIMAL_NAME
}
