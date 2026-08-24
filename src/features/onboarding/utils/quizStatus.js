import { quizQuestions } from '../data/quizQuestions'

export function hasCompletedLifestyleQuiz(user) {
  if (!user) return false
  return quizQuestions.every((question) => {
    const value = user[question.key]
    return value !== undefined && value !== null && value !== ''
  })
}