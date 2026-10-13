import { quizQuestions } from '../data/quizQuestions'
import { isAnswered } from './quizAnswers'

export function hasCompletedLifestyleQuiz(user) {
  if (!user) return false
  return quizQuestions.every((question) => isAnswered(user[question.key]))
}