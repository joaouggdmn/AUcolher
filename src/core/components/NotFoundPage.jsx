import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 pb-16 pt-28">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black text-emerald-950">
          Página não encontrada
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          O endereço acessado não corresponde a nenhuma rota cadastrada.
        </p>
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

export default NotFoundPage
