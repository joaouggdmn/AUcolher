import { FaPaw } from 'react-icons/fa6'

function ContactListItem({ contact, isSelected, onClick }) {
  const initial = contact.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-left transition-colors duration-200 ${
        isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-black text-white">
        {contact.photoUrl ? (
          <img src={contact.photoUrl} alt={contact.name} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-emerald-950">{contact.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
          <FaPaw size={10} className="text-amber-500" />
          Sobre {contact.animalName}
        </p>
      </div>
    </button>
  )
}

export default ContactListItem