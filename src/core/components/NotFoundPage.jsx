import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <div className="rounded-card border border-line bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-brand-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink-900">
          Pagina nao encontrada
        </h1>
        <p className="mt-4 max-w-2xl text-ink-600">
          O endereco acessado nao corresponde a nenhuma rota cadastrada.
        </p>
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

export default NotFoundPage
