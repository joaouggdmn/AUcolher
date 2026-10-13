import { useState } from 'react'
import { getErrorMessage } from '../../../core/utils/apiError'
import { quizQuestions } from '../data/quizQuestions'
import { isAnswered, nextAnswer } from '../utils/quizAnswers'

const ADVANCE_DELAY = 400 // tempo para o usuário "ver" a seleção antes de trocar de pergunta

export function useOnboardingQuiz(onComplete) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const isLastStep = currentStep === quizQuestions.length - 1
  const currentQuestion = quizQuestions[currentStep]
  const selectedValue = answers[currentQuestion.key]
  const isCurrentAnswered = isAnswered(selectedValue)

  const goForward = () => {
    setDirection('forward')
    setCurrentStep((step) => step + 1)
  }

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: nextAnswer(currentQuestion, prev[currentQuestion.key], value) }))

    // Múltipla escolha espera o "Continuar"; a última pergunta não avança
    // sozinha — só habilita o botão "Concluir"
    if (!currentQuestion.multiple && !isLastStep) {
      setTimeout(goForward, ADVANCE_DELAY)
    }
  }

  // "Continuar" das perguntas de múltipla escolha
  const handleNext = () => {
    if (isLastStep || !isCurrentAnswered) return
    goForward()
  }

  const handleBack = () => {
    if (currentStep === 0) return
    setDirection('backward')
    setCurrentStep((step) => step - 1)
  }

  // onComplete grava as respostas (PUT /match/profile) e rejeita se a API
  // recusar: o quiz fica aberto, com as respostas, e mostra o motivo
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onComplete?.(answers)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Não foi possível salvar suas respostas. Tente novamente.'))
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
    isCurrentAnswered,
    isLastStep,
    isSubmitting,
    submitError,
    handleSelect,
    handleNext,
    handleBack,
    handleSubmit,
  }
}