import { useMemo } from 'react'
import { hasCompletedLifestyleQuiz } from '../../features/onboarding/utils/quizStatus'

const PERSON_CHECKLIST = [
  { key: 'nome', label: 'Nome completo', check: (p) => !!p?.name?.trim() },
  { key: 'email', label: 'E-mail', check: (p) => !!p?.email?.trim() },
  { key: 'localizacao', label: 'Localização', check: (p) => !!p?.city?.trim() && !!p?.state },
  {
    key: 'estiloDeVida',
    label: 'Perfil AUmatch',
    // As 7 perguntas do quiz — a mesma regra que reabre o quiz no AUmatch
    check: (p) => hasCompletedLifestyleQuiz(p),
  },
]

// ONG não passa pelo questionário do AUmatch: o que conta é o perfil
// institucional da seção 6.2 das regras de negócio
const ONG_CHECKLIST = [
  { key: 'nome', label: 'Nome da instituição', check: (p) => !!p?.name?.trim() },
  { key: 'logo', label: 'Logo', check: (p) => !!p?.photoUrl },
  { key: 'bio', label: 'Sobre a instituição', check: (p) => !!p?.bio?.trim() },
  { key: 'endereco', label: 'Endereço', check: (p) => !!p?.address?.street && !!p?.address?.city },
  { key: 'visitas', label: 'Horário de visitas', check: (p) => (p?.visitingHours?.length ?? 0) > 0 },
  {
    key: 'contato',
    label: 'Contato ou redes',
    check: (p) => !!p?.institutionalEmail || Object.values(p?.socialLinks ?? {}).some(Boolean),
  },
]

export function useProfileCompletion(profile) {
  return useMemo(() => {
    // Admin não tem perfil público a completar: sem checklist, conta como completo
    if (profile?.userType === 'ADMIN') return { checklist: [], percentage: 100 }

    const definitions = profile?.userType === 'ONG' ? ONG_CHECKLIST : PERSON_CHECKLIST

    const checklist = definitions.map((item) => ({
      key: item.key,
      label: item.label,
      isComplete: item.check(profile),
    }))

    const percentage = Math.round(
      (checklist.filter((item) => item.isComplete).length / checklist.length) * 100
    )

    return { checklist, percentage }
  }, [profile])
}
