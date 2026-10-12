import { Link } from 'react-router-dom'
import { FaEyeSlash } from 'react-icons/fa6'

// Anúncio que saiu do ar pela moderação (conta banida ou anúncio removido):
// quem tem o link vê esta página no lugar do animal
function ListingUnavailable() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FaEyeSlash size={20} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-emerald-950">Anúncio indisponível</h1>
      <p className="mt-2 max-w-md text-slate-500">
        Este anúncio saiu do ar por decisão da moderação do AUcolher e não recebe mais pedidos de interesse.
      </p>
      <Link
        to="/animais"
        className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
      >
        Ver outros animais
      </Link>
    </div>
  )
}

export default ListingUnavailable
