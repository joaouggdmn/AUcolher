import { useState } from 'react'
import { FaStar, FaTrashCan } from 'react-icons/fa6'
import RatingStars from './RatingStars'

const COMMENT_MAX_LENGTH = 500

const RATING_LABELS = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Boa',
  5: 'Excelente',
}

function ReviewForm({ targetName, initialReview, onSubmit, onDelete, onCancel }) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0)
  const [comment, setComment] = useState(initialReview?.comment ?? '')
  const isEditing = Boolean(initialReview)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rating) return
    onSubmit({ rating, comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-form-title"
        className="relative z-10 max-h-full w-full max-w-sm animate-fade-slide-in overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <FaStar size={22} />
          </span>

          <div>
            <h3 id="review-form-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              {isEditing ? 'Editar avaliação' : `Avaliar ${targetName}`}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Sua avaliação fica visível no perfil de {targetName} e ajuda outras pessoas a adotar e doar com
              confiança.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <RatingStars value={rating} onChange={setRating} size={26} />
            <p className="h-4 text-xs font-bold text-amber-600">{RATING_LABELS[rating] ?? ''}</p>
          </div>

          <label className="w-full text-left">
            <span className="text-xs font-semibold text-slate-500">Comentário (opcional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={COMMENT_MAX_LENGTH}
              rows={3}
              placeholder="Conte como foi a experiência..."
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            />
            <span className="block text-right text-[11px] text-slate-400">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
          </label>

          <div className="flex w-full flex-col gap-2.5">
            <button
              type="submit"
              disabled={!rating}
              className="rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? 'Salvar alterações' : 'Enviar avaliação'}
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold text-rose-600 transition-colors duration-300 hover:bg-rose-50"
              >
                <FaTrashCan size={12} />
                Excluir avaliação
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewForm
