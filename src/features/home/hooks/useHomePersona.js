import { useAuth } from '../../../core/context/AuthContext'
import { useReceivedRequests } from '../../../core/hooks/useReceivedRequests'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import { quizQuestions } from '../../onboarding/data/quizQuestions'
import { getFirstName, isAnswered } from '../utils/homePets'

function resolveKind({ user, isAuthenticated, isLoading }) {
  if (isLoading) return 'loading'
  if (!isAuthenticated || !user) return 'visitor'
  if (user.userType === 'ONG') return 'ong'
  // O AUmatch é só de pessoa física: o admin não recebe o convite do quiz
  if (user.userType === 'ADMIN') return 'admin'
  return hasCompletedLifestyleQuiz(user) ? 'matched' : 'pending'
}

// Fonte única do "quem está vendo a home": cada seção recebe isto por props
// em vez de repetir checagens de sessão e de quiz
// kind: 'loading' | 'visitor' | 'pending' | 'matched' | 'ong' | 'admin'
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
