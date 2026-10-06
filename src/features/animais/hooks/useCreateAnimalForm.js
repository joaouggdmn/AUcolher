import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { updateMyProfile } from '../../perfil/services/userService'
import {
  buildOngForm,
  buildPersonForm,
  toApiPayload,
  toOngUpdates,
  toPersonUpdates,
} from '../../perfil/utils/accountForm'
import { isValidAge } from '../utils/ageHelpers'
import { useCreateAnimal } from './useAnimais'

const STEPS = ['basic', 'health', 'compatibility', 'media']

// Mesmos limites da API (AnimalRequestDTO)
export const NAME_MAX_LENGTH = 60
export const BREED_MAX_LENGTH = 60
export const STORY_MAX_LENGTH = 3000

const INITIAL_FORM = {
  name: '',
  species: '',
  breed: '',
  ageValue: '',
  ageUnit: 'YEARS',
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

// A API tira a cidade/UF do anúncio do perfil de quem anuncia. Sem elas no
// banco o cadastro é recusado, então gravamos antes pelo PUT /users/me — que
// substitui o perfil inteiro: o corpo sai do usuário completo, como em
// "Minha conta", senão bio, foto e o resto seriam apagados
async function saveLocationToProfile(user, city, state) {
  let updates
  if (user.userType === 'ONG') {
    const ongUpdates = toOngUpdates(buildOngForm(user))
    updates = { ...ongUpdates, city, state }
    if (ongUpdates.address) updates.address = { ...ongUpdates.address, city, state }
  } else {
    updates = { ...toPersonUpdates(buildPersonForm(user)), city, state }
  }

  const savedProfile = await updateMyProfile(toApiPayload({ ...user, ...updates }, user.userType))
  return { ...updates, ...savedProfile }
}

export function useCreateAnimalForm() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const { mutateAsync: createAnimal } = useCreateAnimal()

  // Calculado UMA vez na montagem — não deve "sumir" o campo se algo mudar
  // no meio do preenchimento (mesmo princípio do isQuizOpen no AumatchPage)
  const [needsLocationInput] = useState(() => !user?.city || !user?.state)

  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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
        isValidAge(formData.ageValue, formData.ageUnit) &&
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
    setSubmitError(null)

    try {
      // A localização informada aqui passa a valer no perfil, não só neste
      // anúncio — e precisa estar no banco antes do POST
      if (needsLocationInput) {
        updateProfile(await saveLocationToProfile(user, formData.city.trim(), formData.state))
      }

      const createdAnimal = await createAnimal({ form: formData, photos: images })
      navigate(`/animais/${createdAnimal.id}`, { state: { justCreated: true } })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Não foi possível cadastrar o animal. Tente novamente.'))
      setIsSubmitting(false)
    }
  }

  return {
    stepIndex, currentStep, isFirstStep, isLastStep, formData, images, setImages,
    updateField, isStepValid: isStepValid(), isSubmitting, submitError, needsLocationInput,
    goNext, goBack, handleSubmit,
  }
}
