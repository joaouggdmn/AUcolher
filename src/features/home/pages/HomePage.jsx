import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main>
      <section
        className="relative flex min-h-[calc(100vh-72px)] items-center bg-cover bg-center px-6 py-24 text-white"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(12, 74, 60, 0.84), rgba(12, 74, 60, 0.48)), url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=80")',
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8">
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            Encontre um novo amigo para chamar de familia.
          </h1>

          <form className="flex w-full max-w-2xl flex-col gap-3 rounded-lg bg-white/95 p-3 shadow-2xl shadow-teal-950/20 sm:flex-row">
            <label className="sr-only" htmlFor="home-search">
              Pesquisar animais
            </label>
            <input
              id="home-search"
              className="min-h-12 flex-1 rounded-md border border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              placeholder="Buscar por nome, especie ou cidade"
              type="search"
            />
            <button
              className="min-h-12 rounded-md bg-teal-700 px-6 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-700"
              type="submit"
            >
              Pesquisar
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-white px-6 py-3 font-bold text-teal-800 shadow-lg shadow-teal-950/20 transition hover:bg-teal-50"
              to="/animais"
            >
              Ver animais
            </Link>
            <Link
              className="rounded-md border border-white/80 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
              to="/cadastro"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
