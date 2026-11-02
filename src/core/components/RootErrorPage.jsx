import { Link, useRouteError } from 'react-router-dom'

function RootErrorPage() {
  const error = useRouteError()
  const message = error?.statusText || error?.message || 'Erro inesperado'

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="rounded-lg border border-rose-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-rose-700">
          Erro
        </p>
        <h1 className="mt-3 text-3xl font-black text-emerald-950">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">{message}</p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-bold text-white transition hover:bg-emerald-900"
          to="/"
        >
          Voltar para a home
        </Link>
      </div>
    </main>
  )
}

export default RootErrorPage
