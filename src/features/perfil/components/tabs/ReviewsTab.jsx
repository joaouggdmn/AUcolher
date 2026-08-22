import { FaStar, FaShieldHalved } from "react-icons/fa6";
import { mockUserReviews } from "../../data/mockUserReviews";

function StarRating({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar
          key={i}
          size={size}
          className={i < rating ? "text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ReviewsTab() {
  if (mockUserReviews.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Você ainda não recebeu avaliações.
      </p>
    );
  }

  const average = (
    mockUserReviews.reduce((sum, r) => sum + r.rating, 0) /
    mockUserReviews.length
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-2xl bg-emerald-50/70 p-5">
        <span className="font-serif text-4xl font-black text-emerald-900">
          {average}
        </span>
        <div>
          <StarRating rating={Math.round(Number(average))} size={15} />
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            {mockUserReviews.length} avaliações recebidas
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {mockUserReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-950">
                  {review.authorName}
                  {review.authorIsOng && (
                    <FaShieldHalved size={12} className="text-amber-500" />
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(review.date)}
                </p>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
              {review.comment}
            </p>{" "}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsTab;
