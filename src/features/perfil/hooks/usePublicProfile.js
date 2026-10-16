import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { getPublicProfile } from '../services/userService'

// Perfil da própria conta: sai exatamente do que ela salvou em "Minha conta",
// com os mesmos campos que outra pessoa veria (o GET
// /users/{id}/public-profile devolve este mesmo formato)
function buildOwnProfile(user) {
  return {
    id: user.id,
    userType: user.userType === 'ONG' ? 'ONG' : 'PESSOA',
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    coverUrl: user.userType === 'ONG' ? (user.coverUrl ?? null) : null,
    city: user.city || user.address?.city,
    state: user.state || user.address?.state,
    bio: user.bio ?? '',
    socialLinks: user.socialLinks,
    address: user.address,
    visitingHours: user.visitingHours ?? [],
    team: user.team ?? [],
    cnpj: user.cnpj ?? null,
    // ONG: o e-mail de login é o contato público. O de pessoa nunca aparece
    email: user.userType === 'ONG' ? user.email : null,
    foundedYear: user.foundedYear ?? null,
    memberSince: user.memberSince ?? null,
    // Selo real do backend (is_verificado) — sem a etapa de aprovação do
    // admin, ONG recém-cadastrada ainda não é verificada
    isVerified: Boolean(user.isVerified),
  }
}

export function usePublicProfile(profileId) {
  const { user } = useAuth()

  // O próprio perfil sai do que a conta acabou de salvar em "Minha conta",
  // sem esperar a API
  const isOwnProfile = user != null && String(user.id) === String(profileId)

  const { data, isLoading } = useQuery({
    queryKey: ['public-profile', String(profileId)],
    queryFn: () => getPublicProfile(profileId),
    enabled: !isOwnProfile,
  })

  if (isOwnProfile) {
    return { profile: buildOwnProfile(user), isLoading: false }
  }

  // null = a API respondeu 404 (conta inexistente, desativada ou admin)
  return { profile: data ?? null, isLoading }
}
