import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { getPublicProfile } from '../services/userService'

// Contas reais criadas nos testes não estão no mock — monta um perfil
// básico com o que já existe localmente (usuário logado, anúncios e
// pedidos). Some junto com o mock quando a API real responder por
// qualquer id
function buildLocalProfile(profileId, { user, animals, requests }) {
  const id = String(profileId)

  if (user && String(user.id) === id) {
    return {
      id: user.id,
      userType: user.userType === 'ONG' ? 'ONG' : 'PESSOA',
      name: user.name,
      photoUrl: user.photoUrl ?? null,
      city: user.cidade,
      state: user.estado,
      bio: user.bio ?? '',
      // ONG só consegue logar e anunciar depois de aprovada pelo admin
      isVerified: user.userType === 'ONG',
    }
  }

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

  const { data, isLoading } = useQuery({
    queryKey: ['public-profile', String(profileId)],
    queryFn: () => getPublicProfile(profileId),
  })

  const profile = data ?? (isLoading ? null : buildLocalProfile(profileId, { user, animals, requests }))

  return { profile, isLoading }
}
