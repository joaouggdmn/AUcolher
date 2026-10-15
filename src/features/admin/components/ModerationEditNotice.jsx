import { FaShieldHalved } from 'react-icons/fa6'

// Em cima dos formulários de edição da moderação: o admin está mexendo no
// conteúdo de outra pessoa, que continua em nome dela
function ModerationEditNotice({ owner }) {
  return (
    <p className="mb-6 flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-900">
      <FaShieldHalved size={14} className="mt-0.5 shrink-0" />
      <span>
        Você está editando como moderação. O conteúdo continua em nome de {owner}, que vai ver "Editado pela moderação"
        com a data de hoje.
      </span>
    </p>
  )
}

export default ModerationEditNotice
