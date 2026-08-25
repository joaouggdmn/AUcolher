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
  city: '',   // 🆕 só usado quando o usuário ainda não tem localização no perfil
  state: '',  // 🆕
  vaccinated: false,
  neutered: false,
  dewormed: false,
  specialNeeds: false,
  energyLevel: '',
  temperament: '',
  independenceLevel: '',
  vocalization: '',
  goodWithChildren: null,
  goodWithDogs: null,
  goodWithCats: null,
  apartmentFriendly: null,
  summary: '',
  story: '',
}

export function useCreateAnimalForm() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const { addAnimal } = useAnimals()

  // Calculado UMA vez na montagem — não deve "sumir" o campo se algo mudar
  // no meio do preenchimento (mesmo princípio do isQuizOpen no AumatchPage)
  const [needsLocationInput] = useState(() => !user?.cidade || !user?.estado)

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
      const hasBasicFields =
        formData.name.trim() !== '' &&
        formData.species !== '' &&
        formData.breed.trim() !== '' &&
        formData.ageValue !== '' &&
        formData.sex !== '' &&
        formData.size !== ''

      if (!needsLocationInput) return hasBasicFields
      return hasBasicFields && formData.city.trim() !== '' && formData.state !== ''
    }
    if (currentStep === 'compatibility') {
      return (
        formData.energyLevel !== '' &&
        formData.temperament !== '' &&
        formData.independenceLevel !== '' &&
        formData.vocalization !== '' &&
        formData.goodWithChildren !== null &&
        formData.goodWithDogs !== null &&
        formData.goodWithCats !== null &&
        formData.apartmentFriendly !== null
      )
    }
    if (currentStep === 'media') {
      return images.length > 0 && formData.summary.trim() !== '' && formData.story.trim() !== ''
    }
    return true
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
    const city = needsLocationInput ? formData.city : user?.cidade
    const state = needsLocationInput ? formData.state : user?.estado

    const newAnimalPayload = {
      ...formData,
      ageValue: Number(formData.ageValue),
      ageLabel: buildAgeLabel(Number(formData.ageValue), formData.ageUnit),
      ageGroup: deriveAgeGroup(Number(formData.ageValue), formData.ageUnit),
      images,
      photoUrl: images[0],
      city: city || 'Não informado',
      state: state || '--',
      distanceKm: 0,
      listingType: isNgo ? 'NGO' : 'USER',
      organizationName: isNgo ? user?.name : undefined,
      ownerName: user?.name,
      ownerPhotoUrl: user?.photoUrl ?? null,
      ownerId: user?.id,
    }

    // 🔴 Aqui entra a chamada real: await animalService.create(newAnimalPayload)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const createdAnimal = addAnimal(newAnimalPayload)

    // 🆕 Mesma lógica de sincronização usada em handleQuizComplete
    // (updateProfile(answers)) — a localização informada aqui passa a
    // valer permanentemente no perfil, não só neste anúncio
    if (needsLocationInput) {
      updateProfile({ cidade: formData.city, estado: formData.state })
    }

    setIsSubmitting(false)
    navigate(`/animais/${createdAnimal.id}`, { state: { justCreated: true } })
  }

  return {
    stepIndex, currentStep, isFirstStep, isLastStep, formData, images, setImages,
    updateField, isStepValid: isStepValid(), isSubmitting, needsLocationInput,
    goNext, goBack, handleSubmit,
  }
}