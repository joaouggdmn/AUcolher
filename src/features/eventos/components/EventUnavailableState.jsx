import { Link } from 'react-router-dom'
import { FaCalendarXmark } from 'react-icons/fa6'

// Tela cheia para quando o evento não pode ser exibido ou editado:
// não existe/cancelado (padrão), não é da ONG logada, já aconteceu...
function EventUnavailableState({
  icon: Icon = FaCalendarXmark,
  title = 'Evento não encontrado',
  message = 'Esse evento pode ter sido cancelado pela ONG ou o link está incorreto.',
  linkTo = '/eventos',
  linkLabel = 'Ver outros eventos',
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink-500">
        <Icon size={20} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brand-950">{title}</h1>
      <p className="mt-2 max-w-md text-ink-500">{message}</p>
      <Link
        to={linkTo}
        className="mt-6 inline-block rounded-control bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

export default EventUnavailableState
