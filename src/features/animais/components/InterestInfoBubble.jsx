import { FaComments } from 'react-icons/fa6'

function InterestInfoBubble() {
  return (
    <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 animate-wiggle items-center justify-center rounded-full bg-emerald-700 text-white">
          <FaComments size={15} />
        </span>
        <div>
          <p className="text-sm font-bold text-emerald-900">Como funciona?</p>
          <p className="mt-0.5 text-sm leading-relaxed text-emerald-700/90">
            Envie seu pedido! O protetor avaliará seu perfil e, se der match, um chat será liberado para vocês combinarem tudo.
          </p>
        </div>
      </div>

      {/* "Orelha" do balão, apontando para o botão logo abaixo */}
      <div className="absolute -bottom-2 left-9 h-4 w-4 rotate-45 border-b border-r border-emerald-200 bg-emerald-50" />
    </div>
  )
}

export default InterestInfoBubble