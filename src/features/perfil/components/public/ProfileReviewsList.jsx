import { FaStar } from 'react-icons/fa6'
import RatingStars from '../../../avaliacoes/components/RatingStars'
import ReviewCard from '../../../avaliacoes/components/ReviewCard'

function ProfileReviewsList({ reviews, average, count, distribution }) {
  if (count === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <FaStar size={18} />
        </span>
        <p className="text-sm font-semibold text-slate-600">Ainda não há avaliações para este perfil.</p>
        <p className="max-w-sm text-xs text-slate-400">
          As avaliações aparecem aqui depois que uma adoção é concluída na plataforma.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-2xl bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-4 sm:flex-col sm:gap-1 sm:text-center">
          <span className="font-serif text-5xl font-black text-emerald-900">{average.toFixed(1).replace('.', ',')}</span>
          <div className="flex flex-col gap-1 sm:items-center">
            <RatingStars value={Math.round(average)} size={16} />
            <p className="text-xs font-semibold text-emerald-700">
              {count} {count === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-1.5" aria-label="Distribuição das notas">
          {distribution.map(({ stars, count: starCount }) => (
            <li key={stars} className="flex items-center gap-3 text-xs font-semibold text-emerald-800">
              <span className="flex w-7 shrink-0 items-center gap-1">
                {stars}
                <FaStar size={10} className="text-amber-400" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <span
                  className="block h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(starCount / count) * 100}%` }}
                />
              </span>
              <span className="w-5 shrink-0 text-right text-emerald-700">{starCount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}

export default ProfileReviewsList
