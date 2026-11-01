import { Link } from 'react-router-dom'
import { FaHandHoldingHeart } from 'react-icons/fa6'

// Tela cheia para quando a campanha não pode ser exibida ou editada:
// não existe/excluída (padrão), não é da ONG logada, já foi encerrada...
function CampaignUnavailableState({
  icon: Icon = FaHandHoldingHeart,
  title = 'Campanha não encontrada',
  message = 'Essa campanha pode ter sido removida pela ONG ou o link está incorreto.',
  linkTo = '/campanhas',
  linkLabel = 'Ver outras campanhas',
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={20} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-emerald-950">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">{message}</p>
      <Link
        to={linkTo}
        className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

export default CampaignUnavailableState
