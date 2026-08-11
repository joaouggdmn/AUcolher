import { useState } from 'react'
import { quizQuestions } from '../data/quizQuestions'

const ADVANCE_DELAY = 400 // tempo para o usuário "ver" a seleção antes de trocar de pergunta

export function useOnboardingQuiz(onComplete) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLastStep = currentStep === quizQuestions.length - 1
  const currentQuestion = quizQuestions[currentStep]
  const selectedValue = answers[currentQuestion.key]

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }))

    // Última pergunta não avança sozinha — só habilita o botão "Concluir"
    if (!isLastStep) {
      setDirection('forward')
      setTimeout(() => setCurrentStep((step) => step + 1), ADVANCE_DELAY)
    }
  }

  const handleBack = () => {
    if (currentStep === 0) return
    setDirection('backward')
    setCurrentStep((step) => step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // 🔴 Aqui entra a chamada real: onboardingService.submitProfile(answers)
      await new Promise((resolve) => setTimeout(resolve, 900))
      onComplete?.(answers)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    currentStep,
    totalSteps: quizQuestions.length,
    direction,
    currentQuestion,
    selectedValue,
    isLastStep,
    isSubmitting,
    handleSelect,
    handleBack,
    handleSubmit,
  }
}