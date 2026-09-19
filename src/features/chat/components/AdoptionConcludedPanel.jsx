import { useState } from 'react'
import { FaHeart, FaPen, FaStar } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import RatingStars from '../../avaliacoes/components/RatingStars'
import ReviewForm from '../../avaliacoes/components/ReviewForm'

function AdoptionConcludedPanel({ contact }) {
  const { user } = useAuth()
  const { saveReview, deleteReview } = useAdoptionRequests()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const myRole = contact.isOwnerView ? 'owner' : 'adopter'
  const otherRole = contact.isOwnerView ? 'adopter' : 'owner'
  const myReview = contact.reviews?.[myRole] ?? null
  const receivedReview = contact.reviews?.[otherRole] ?? null
  const firstName = contact.name.split(' ')[0]

  const handleSubmit = ({ rating, comment }) => {
    saveReview(contact.requestId, myRole, {
      rating,
      comment,
      author: {
        id: user?.id,
        name: user?.name,
        photoUrl: user?.photoUrl,
        isOng: user?.userType === 'ONG',
      },
    })
    setIsFormOpen(false)
  }

  const handleDelete = () => {
    deleteReview(contact.requestId, myRole)
    setIsFormOpen(false)
  }

  return (
    <div className="shrink-0 border-t bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-md shadow-amber-500/30">
          <FaHeart size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-base font-bold text-emerald-950">Parabéns pela adoção!</p>
          <p className="text-xs text-slate-500">{contact.animalName} agora faz parte de uma nova família.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5 rounded-2xl bg-slate-50 p-3.5">
        {myReview ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Sua avaliação para {firstName}</p>
              <div className="mt-1">
                <RatingStars value={myReview.rating} size={14} />
              </div>
              {myReview.comment && (
                <p className="mt-1.5 line-clamp-2 break-words text-xs text-slate-600">{myReview.comment}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors duration-300 hover:bg-emerald-50"
            >
              <FaPen size={10} />
              Editar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-950">Como foi sua experiência com {firstName}?</p>
              <p className="text-xs text-slate-500">Sua avaliação ajuda outras pessoas a adotar e doar com confiança.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
            >
              <FaStar size={12} className="text-amber-300" />
              Avaliar {firstName}
            </button>
          </div>
        )}

        {receivedReview && (
          <div className="border-t border-slate-200 pt-2.5">
            <p className="text-xs font-semibold text-slate-500">{firstName} avaliou você</p>
            <div className="mt-1">
              <RatingStars value={receivedReview.rating} size={14} />
            </div>
            {receivedReview.comment && (
              <p className="mt-1.5 line-clamp-2 break-words text-xs text-slate-600">{receivedReview.comment}</p>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ReviewForm
          targetName={contact.name}
          initialReview={myReview}
          onSubmit={handleSubmit}
          onDelete={myReview ? handleDelete : undefined}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  )
}

export default AdoptionConcludedPanel
