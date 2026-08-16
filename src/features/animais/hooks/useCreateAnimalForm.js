import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { buildAgeLabel, deriveAgeGroup } from '../utils/ageHelpers'

const STEPS = ['basic', 'health', 'compatibility', 'media']

const INITIAL_FORM = {
  name: '',
  species: '',
  breed: '',
  ageValue: '',
  ageUnit: 'ANOS',
  sex: '',
  size: '',
  vaccinated: false,
  neutered: false,
  dewormed: false,
  specialNeeds: false,
  energyLevel: '',
  goodWithChildren: null,
  goodWithDogs: null,
  goodWithCats: null,
  apartmentFriendly: null,
  summary: '',
  story: '',
}

export function useCreateAnimalForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addAnimal } = useAnimals()

  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStep = STEPS[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEPS.length - 1

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    if (currentStep === 'basic') {
      return (
        formData.name.trim() !== '' &&
        formData.species !== '' &&
        formData.breed.trim() !== '' &&
        formData.ageValue !== '' &&
        formData.sex !== '' &&
        formData.size !== ''
      )
    }
    if (currentStep === 'compatibility') {
      return (
        formData.energyLevel !== '' &&
        formData.goodWithChildren !== null &&
        formData.goodWithDogs !== null &&
        formData.goodWithCats !== null &&
        formData.apartmentFriendly !== null
      )
    }
    if (currentStep === 'media') {
      return images.length > 0 && formData.summary.trim() !== '' && formData.story.trim() !== ''
    }
    return true // 'health' é opcional — nem todo pet tem todos os cuidados em dia ainda
  }

  const goNext = () => {
    if (!isStepValid() || isLastStep) return
    setStepIndex((i) => i + 1)
  }

  const goBack = () => {
    if (isFirstStep) return
    setStepIndex((i) => i - 1)
  }

  const handleSubmit = async () => {
    if (!isStepValid()) return
    setIsSubmitting(true)

    const isNgo = user?.userType === 'ONG'

    const newAnimalPayload = {
      ...formData,
      ageValue: Number(formData.ageValue),
      ageLabel: buildAgeLabel(Number(formData.ageValue), formData.ageUnit),
      ageGroup: deriveAgeGroup(Number(formData.ageValue), formData.ageUnit),
      images,
      photoUrl: images[0], // compatibilidade com componentes que esperam uma foto única
      city: user?.cidade || 'Não informado',
      state: user?.estado || '--',
      distanceKm: 0, // 🔴 cálculo real virá de geolocalização, futuramente
      listingType: isNgo ? 'NGO' : 'USER',
      organizationName: isNgo ? user?.name : undefined,
      ownerId: user?.id,
    }

    // 🔴 Aqui entra a chamada real: await animalService.create(newAnimalPayload)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const createdAnimal = addAnimal(newAnimalPayload)
    setIsSubmitting(false)

    navigate(`/animais/${createdAnimal.id}`, { state: { justCreated: true } })
  }

  return {
    stepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    formData,
    images,
    setImages,
    updateField,
    isStepValid: isStepValid(),
    isSubmitting,
    goNext,
    goBack,
    handleSubmit,
  }
}