function Spinner() {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />
      <span className="sr-only">Carregando</span>
    </div>
  )
}

export default Spinner
