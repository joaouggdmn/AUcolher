import { Link, useRouteError } from 'react-router-dom'

function RootErrorPage() {
  const error = useRouteError()
  const message = error?.statusText || error?.message || 'Erro inesperado'

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="rounded-card border border-danger-600/30 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-danger-700">
          Erro
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink-900">
          Nao foi possivel carregar esta pagina
        </h1>
        <p className="mt-4 max-w-2xl text-ink-600">{message}</p>
        <Link
          className="mt-6 inline-flex rounded-md bg-brand-600 px-5 py-3 font-bold text-white transition hover:bg-brand-700"
          to="/"
        >
          Voltar para a home
        </Link>
      </div>
    </main>
  )
}

export default RootErrorPage
