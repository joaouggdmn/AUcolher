import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMagnifyingGlass } from 'react-icons/fa6'

// Mesmo contrato da busca antiga: termo vazio abre a lista completa. O
// placeholder descreve o que a listagem de fato filtra (nome, raça, cidade)
function HomeSearch({ labelledBy, className = '' }) {
  const navigate = useNavigate()
  const inputId = useId()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    navigate(trimmed ? `/animais?search=${encodeURIComponent(trimmed)}` : '/animais')
  }

  return (
    <form
      role="search"
      aria-labelledby={labelledBy}
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lg shadow-emerald-950/5 ring-1 ring-slate-200 transition-shadow duration-300 focus-within:ring-2 focus-within:ring-emerald-700 ${className}`}
    >
      <FaMagnifyingGlass aria-hidden="true" className="shrink-0 text-slate-400" size={16} />

      <label className="sr-only" htmlFor={inputId}>
        Buscar animais por nome, raça ou cidade
      </label>
      <input
        id={inputId}
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Nome, raça ou cidade"
        className="min-w-0 flex-1 border-none bg-transparent text-base text-emerald-950 outline-none placeholder:text-slate-400"
      />

      <button
        type="submit"
        className="shrink-0 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      >
        Buscar
      </button>
    </form>
  )
}

export default HomeSearch
