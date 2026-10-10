import { useState } from 'react'
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
import { useCreateAnimal, useUpdateAnimal } from './useAnimais'

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

// Animal da API → valores do formulário (a idade vira texto, como no input)
function toFormValues(animal) {
  const fields = Object.keys(INITIAL_FORM).filter((field) => field !== 'city' && field !== 'state')
  return {
    ...INITIAL_FORM,
    ...Object.fromEntries(fields.map((field) => [field, animal[field] ?? INITIAL_FORM[field]])),
    ageValue: String(animal.ageValue ?? ''),
  }
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

// Cadastro e edição do anúncio. Com `animal`, edita (PUT); sem, cadastra
// (POST). `onSaved(animalSalvo)` decide para onde ir depois — cada tela tem o
// seu destino (página do animal, lista do painel)
export function useAnimalForm({ animal = null, onSaved }) {
  const { user, updateProfile } = useAuth()
  const { mutateAsync: createAnimal } = useCreateAnimal()
  const { mutateAsync: updateAnimal } = useUpdateAnimal()
  const isEditing = animal != null

  // Calculado UMA vez na montagem — não deve "sumir" o campo se algo mudar
  // no meio do preenchimento (mesmo princípio do isQuizOpen no AumatchPage).
  // Na edição não se aplica: o anúncio já existe, e a cidade vem do perfil
  const [needsLocationInput] = useState(() => !isEditing && (!user?.city || !user?.state))

  const [stepIndex, setStepIndex] = useState(0)
  const [formData, setFormData] = useState(() => (isEditing ? toFormValues(animal) : INITIAL_FORM))
  const [images, setImages] = useState(() => (isEditing ? animal.images : []))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const currentStep = STEPS[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEPS.length - 1

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step) => {
    if (step === 'basic') {
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
    if (step === 'compatibility') {
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
    if (step === 'media') {
      return images.length > 0 && formData.summary.trim() !== '' && formData.story.trim() !== ''
    }
    return true
  }

  const isStepValid = validateStep(currentStep)
  const isFormValid = STEPS.every(validateStep)

  const goNext = () => {
    if (!isStepValid || isLastStep) return
    setStepIndex((i) => i + 1)
  }

  // Pular direto para uma etapa só quando todas as anteriores estão completas
  const goToStep = (index) => {
    if (STEPS.slice(0, index).every(validateStep)) setStepIndex(index)
  }

  const goBack = () => {
    if (isFirstStep) return
    setStepIndex((i) => i - 1)
  }

  const handleSubmit = async () => {
    if (!isFormValid) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // A localização informada aqui passa a valer no perfil, não só neste
      // anúncio — e precisa estar no banco antes do POST
      if (needsLocationInput) {
        updateProfile(await saveLocationToProfile(user, formData.city.trim(), formData.state))
      }

      const savedAnimal = isEditing
        ? await updateAnimal({ id: animal.id, form: formData, photos: images })
        : await createAnimal({ form: formData, photos: images })
      onSaved(savedAnimal)
    } catch (error) {
      const fallback = isEditing
        ? 'Não foi possível salvar as alterações. Tente novamente.'
        : 'Não foi possível cadastrar o animal. Tente novamente.'
      setSubmitError(getErrorMessage(error, fallback))
      setIsSubmitting(false)
    }
  }

  return {
    stepIndex, currentStep, isFirstStep, isLastStep, formData, images, setImages,
    updateField, isStepValid, isFormValid, isEditing, isSubmitting, submitError, needsLocationInput,
    goNext, goBack, goToStep, handleSubmit,
  }
}
