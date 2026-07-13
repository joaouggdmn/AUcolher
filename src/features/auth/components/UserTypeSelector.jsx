import { FaPaw, FaHouseChimneyUser } from 'react-icons/fa6'

const USER_TYPES = [
  {
    value: 'ADOTANTE',
    title: 'Quero adotar',
    description: 'Buscar meu novo companheiro',
    icon: FaPaw,
  },
  {
    value: 'ONG',
    title: 'Sou ONG / Protetor',
    description: 'Cadastrar animais para adoção',
    icon: FaHouseChimneyUser,
  },
]

function UserTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {USER_TYPES.map(({ value: type, title, description, icon: Icon }) => {
        const isSelected = value === type

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
              isSelected
                ? 'border-amber-400 bg-emerald-50 shadow-md shadow-emerald-900/5'
                : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Icon size={16} />
            </span>

            <div>
              <p className={`text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
                {title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default UserTypeSelector