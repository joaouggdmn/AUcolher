function ShowMoreButton({ onClick, remainingCount }) {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-full border border-emerald-200 bg-white px-8 py-3 text-sm font-bold text-emerald-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md"
      >
        Mostrar mais {remainingCount > 0 && remainingCount < 12 ? `(${remainingCount})` : ''}
      </button>
    </div>
  )
}

export default ShowMoreButton