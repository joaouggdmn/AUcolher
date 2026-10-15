import { Link } from 'react-router-dom'
import { FaFlask } from 'react-icons/fa6'

// 🔴 Modo mock: o link que iria por e-mail aparece aqui para testar o fluxo
function MockResetLinkBox({ result }) {
  if (!result) return null
  const testUrl = result.testLink ? new URL(result.testLink) : null
  const linkPath = testUrl ? testUrl.pathname + testUrl.search : null

  return (
    <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
      <p className="flex items-center gap-2 font-bold">
        <FaFlask size={12} />
        Modo de teste: nenhum e-mail é enviado
      </p>
      {linkPath ? (
        <>
          <p className="mt-1 text-amber-800">Este é o link que chegaria por e-mail (vale 30 minutos, uso único):</p>
          <Link to={linkPath} className="mt-1 block break-all font-semibold text-emerald-800 underline">
            {result.testLink}
          </Link>
        </>
      ) : (
        <p className="mt-1 text-amber-800">
          Já foi gerado um link para este e-mail há menos de 1 minuto, então nenhum novo foi criado.
        </p>
      )}
    </div>
  )
}

export default MockResetLinkBox
