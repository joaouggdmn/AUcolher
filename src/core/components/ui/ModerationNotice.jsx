import { FaShieldHalved } from 'react-icons/fa6'

// Faixa que só o admin vê numa página que saiu do ar para o resto do site
// (anúncio ou perfil de conta banida): ele confere o conteúdo que moderou
function ModerationNotice({ children }) {
  return (
    <p className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800">
      <FaShieldHalved size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

export default ModerationNotice
