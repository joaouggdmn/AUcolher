import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaPaw, FaStar, FaEye, FaUserPen, FaUserSlash } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import Spinner from '../../../core/components/ui/Spinner'
import AnimalCard from '../../animais/components/AnimalCard'
import { useUserReviews } from '../../avaliacoes/hooks/useUserReviews'
import { usePublicProfile } from '../hooks/usePublicProfile'
import ProfileTabs from '../components/ProfileTabs'
import PublicProfileHeader from '../components/public/PublicProfileHeader'
import OngDetails from '../components/public/OngDetails'
import ProfileReviewsList from '../components/public/ProfileReviewsList'

function PublicProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { animals } = useAnimals()
  const { requests } = useAdoptionRequests()
  const { profile, isLoading } = usePublicProfile(id)
  const reviewsData = useUserReviews(id)

  // 🔴 Com a API real: GET /usuarios/{id}/animais?status=DISPONIVEL
  const availableAnimals = useMemo(
    () => animals.filter((animal) => String(animal.ownerId) === id && animal.status !== 'ADOTADO'),
    [animals, id],
  )

  const liveConcludedAdoptions = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === 'CONCLUDED' &&
          (String(request.ownerId) === id ||
            (request.adopter?.userId != null && String(request.adopter.userId) === id)),
      ).length,
    [requests, id],
  )

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-32 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FaUserSlash size={20} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-emerald-950">Perfil não encontrado</h1>
        <p className="mt-2 text-slate-500">Essa conta pode ter sido removida ou o link está incorreto.</p>
        <Link
          to="/animais"
          className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          Ver animais para adoção
        </Link>
      </div>
    )
  }

  const isOng = profile.userType === 'ONG'
  const isOwnProfile = Boolean(user) && String(user.id) === id
  const firstName = isOng ? profile.name : profile.name.split(' ')[0]

  // Mock: contagem histórica do seed + adoções concluídas nos testes locais
  const stats = {
    adoptionsCount: (profile.adoptionsCount ?? 0) + liveConcludedAdoptions,
    availableAnimalsCount: availableAnimals.length,
    rating: { average: reviewsData.average, count: reviewsData.count },
  }

  const animalsContent =
    availableAnimals.length > 0 ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {availableAnimals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaPaw size={18} />
        </span>
        <p className="text-sm font-semibold text-slate-600">
          {firstName} não tem animais disponíveis para adoção no momento.
        </p>
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      {isOwnProfile && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <FaEye size={14} className="shrink-0" />
            Esta é a forma como as outras pessoas veem o seu perfil.
          </p>
          <Link
            to="/perfil"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            <FaUserPen size={12} />
            Editar perfil
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <PublicProfileHeader profile={profile} stats={stats} />

        {isOng && <OngDetails profile={profile} />}

        <ProfileTabs
          tabs={[
            {
              key: 'animais',
              label: `Animais para Adoção (${availableAnimals.length})`,
              icon: FaPaw,
              content: animalsContent,
            },
            {
              key: 'avaliacoes',
              label: `Avaliações (${reviewsData.count})`,
              icon: FaStar,
              content: <ProfileReviewsList {...reviewsData} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default PublicProfilePage
