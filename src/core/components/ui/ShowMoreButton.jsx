function ShowMoreButton({ onClick, remainingCount }) {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-control border border-brand-200 bg-white px-8 py-3 text-sm font-bold text-brand-700 transition-colors duration-200 hover:border-brand-400 hover:bg-brand-50"
      >
        Mostrar mais {remainingCount > 0 && remainingCount < 12 ? `(${remainingCount})` : ''}
      </button>
    </div>
  )
}

export default ShowMoreButton