import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Pagina nao encontrada
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          O endereco acessado nao corresponde a nenhuma rota cadastrada.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800"
          to="/"
        >
          Voltar para a home
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
