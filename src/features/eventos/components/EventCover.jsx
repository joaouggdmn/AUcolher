import { getCategoriaMeta } from './filters/filterOptions'

// Capa é opcional: sem imagem, o evento ganha um fundo da marca com o ícone
// da categoria, em vez de repetir a foto de outro evento
function EventCover({ event, className = '' }) {
  if (event.coverUrl) {
    return <img src={event.coverUrl} alt={event.title} className={`h-full w-full object-cover ${className}`} />
  }

  const { icon: CategoriaIcon } = getCategoriaMeta(event.category)

  return (
    <div
      role="img"
      aria-label={event.title}
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-emerald-100/30 ${className}`}
    >
      <CategoriaIcon size={56} />
    </div>
  )
}

export default EventCover
