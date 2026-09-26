import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { getPublicProfile } from '../services/userService'

// Perfil da própria conta: sai exatamente do que ela salvou em "Minha conta",
// com os mesmos campos que outra pessoa veria. 🔴 Com a API real, o
// GET /usuarios/{id}/perfil-publico devolve este mesmo formato
function buildOwnProfile(user) {
  return {
    id: user.id,
    userType: user.userType === 'ONG' ? 'ONG' : 'PESSOA',
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    city: user.cidade || user.address?.city,
    state: user.estado || user.address?.state,
    bio: user.bio ?? '',
    socialLinks: user.socialLinks,
    address: user.address,
    visitingHours: user.visitingHours ?? [],
    team: user.team ?? [],
    cnpj: user.cnpj ?? null,
    institutionalEmail: user.institutionalEmail ?? null,
    foundedYear: user.foundedYear ?? null,
    memberSince: user.memberSince ?? null,
    // Selo real do backend (is_verificado) — sem a etapa de aprovação do
    // admin, ONG recém-cadastrada ainda não é verificada
    isVerified: Boolean(user.isVerified),
  }
}

// Contas reais criadas nos testes não estão no mock — monta um perfil
// básico com o que já existe localmente (anúncios e pedidos). Some junto
// com o mock quando a API real responder por qualquer id
function buildLocalProfile(profileId, { animals, requests }) {
  const id = String(profileId)

  const ownedAnimal = animals.find((animal) => String(animal.ownerId) === id)
  if (ownedAnimal) {
    const isOng = ownedAnimal.listingType === 'NGO'
    return {
      id: ownedAnimal.ownerId,
      userType: isOng ? 'ONG' : 'PESSOA',
      name: isOng ? (ownedAnimal.organizationName ?? ownedAnimal.ownerName) : ownedAnimal.ownerName,
      photoUrl: ownedAnimal.ownerPhotoUrl ?? null,
      city: ownedAnimal.city,
      state: ownedAnimal.state,
      bio: '',
      isVerified: isOng,
    }
  }

  const request = requests.find((r) => r.adopter?.userId != null && String(r.adopter.userId) === id)
  if (request) {
    return {
      id: request.adopter.userId,
      userType: 'PESSOA',
      name: request.adopter.name,
      photoUrl: request.adopter.photoUrl ?? null,
      city: request.adopter.city,
      state: request.adopter.state,
      bio: '',
    }
  }

  return null
}

export function usePublicProfile(profileId) {
  const { user } = useAuth()
  const { animals } = useAnimals()
  const { requests } = useAdoptionRequests()

  // Os ids do mock (1, 2, 4...) coincidem com ids reais do banco — sem este
  // desvio, "Meu perfil público" podia abrir o perfil mockado de outra pessoa
  const isOwnProfile = user != null && String(user.id) === String(profileId)

  const { data, isLoading } = useQuery({
    queryKey: ['public-profile', String(profileId)],
    queryFn: () => getPublicProfile(profileId),
    enabled: !isOwnProfile,
  })

  if (isOwnProfile) {
    return { profile: buildOwnProfile(user), isLoading: false }
  }

  const profile = data ?? (isLoading ? null : buildLocalProfile(profileId, { animals, requests }))

  return { profile, isLoading }
}
