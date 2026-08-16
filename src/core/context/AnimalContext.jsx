import { createContext, useContext, useState } from 'react'
import { animalsSeed } from '../../features/animais/data/animalsSeed'

const AnimalContext = createContext(null)

export function AnimalProvider({ children }) {
  const [animals, setAnimals] = useState(animalsSeed)

  function addAnimal(animalData) {
    const newAnimal = {
      id: Date.now(), // 🔴 mock: o backend assumirá a geração real do id
      createdAt: new Date().toISOString(),
      ...animalData,
    }
    setAnimals((prev) => [newAnimal, ...prev])
    return newAnimal
  }

  return <AnimalContext.Provider value={{ animals, addAnimal }}>{children}</AnimalContext.Provider>
}

export function useAnimals() {
  const context = useContext(AnimalContext)
  if (!context) throw new Error('useAnimals deve ser usado dentro de um AnimalProvider')
  return context
}