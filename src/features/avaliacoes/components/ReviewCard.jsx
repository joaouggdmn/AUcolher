import { FaPaw, FaShieldHalved } from 'react-icons/fa6'
import RatingStars from './RatingStars'

function formatReviewDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ReviewCard({ review }) {
  const initial = review.authorName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-black text-white">
          {review.authorPhotoUrl ? (
            <img src={review.authorPhotoUrl} alt={review.authorName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold text-emerald-950">
                {review.authorName}
                {review.authorIsOng && (
                  <FaShieldHalved size={12} className="shrink-0 text-amber-500" title="Instituição verificada" />
                )}
              </p>
              <p className="text-xs text-slate-400">{formatReviewDate(review.createdAt)}</p>
            </div>
            <RatingStars value={review.rating} size={13} />
          </div>

          {review.comment && (
            <p className="mt-3 break-words text-sm leading-relaxed text-slate-600">{review.comment}</p>
          )}

          {review.animalName && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <FaPaw size={10} />
              Adoção de {review.animalName}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ReviewCard
