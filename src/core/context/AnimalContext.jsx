import { createContext, useContext, useEffect, useState } from 'react'
import { animalsSeed } from '../../features/animais/data/animalsSeed'
import { ANIMALS_STORAGE_KEY } from '../utils/storageKeys'

const AnimalContext = createContext(null)

function loadInitialAnimals() {
  try {
    const stored = localStorage.getItem(ANIMALS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // localStorage corrompido ou indisponível — cai para o seed
  }
  return animalsSeed
}

export function AnimalProvider({ children }) {
  const [animals, setAnimals] = useState(loadInitialAnimals)

  // Persiste toda alteração — o localStorage funciona como "banco de
  // dados" mockado, compartilhado entre abas do mesmo navegador
  useEffect(() => {
    localStorage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify(animals))
  }, [animals])

  // Sincroniza em tempo real quando OUTRA aba cadastra um animal novo
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== ANIMALS_STORAGE_KEY || !event.newValue) return
      try {
        setAnimals(JSON.parse(event.newValue))
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

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