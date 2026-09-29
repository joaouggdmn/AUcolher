import { useAuth } from '../../../core/context/AuthContext'
import { useReceivedRequests } from '../../../core/hooks/useReceivedRequests'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import { quizQuestions } from '../../onboarding/data/quizQuestions'
import { isAnswered } from '../data/exampleProfile'
import { getFirstName } from '../utils/homePets'

function resolveKind({ user, isAuthenticated, isLoading }) {
  if (isLoading) return 'loading'
  if (!isAuthenticated || !user) return 'visitor'
  if (user.userType === 'ONG') return 'ong'
  // ADMIN cai aqui junto com pessoa: o que muda é só se já fez o quiz
  return hasCompletedLifestyleQuiz(user) ? 'matched' : 'pending'
}

// Fonte única do "quem está vendo a home": cada seção recebe isto por props
// em vez de repetir checagens de sessão e de quiz
// kind: 'loading' | 'visitor' | 'pending' | 'matched' | 'ong'
export function useHomePersona() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { pendingCount } = useReceivedRequests()

  const answered = quizQuestions.filter((question) => isAnswered(user?.[question.key])).length

  return {
    kind: resolveKind({ user, isAuthenticated, isLoading }),
    user,
    firstName: getFirstName(user?.name),
    pendingCount,
    quizProgress: {
      answered,
      total: quizQuestions.length,
      missing: quizQuestions.length - answered,
    },
  }
}
