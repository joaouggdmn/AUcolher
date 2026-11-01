function Spinner() {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-600" />
      <span className="sr-only">Carregando</span>
    </div>
  )
}

export default Spinner
