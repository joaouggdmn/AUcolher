import { useRef } from 'react'
import OngAvatar from './OngAvatar'

// Abas acessíveis: só a ONG ativa entra no Tab, e as setas trocam de ONG
// (padrão WAI-ARIA de tablist). No mobile os chips rolam na horizontal
function OngSelector({ ongs, selectedName, onSelect, panelId }) {
  const tabRefs = useRef([])

  const handleKeyDown = (event, index) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + ongs.length) % ongs.length
    onSelect(ongs[next].name)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Escolha uma ONG"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {ongs.map((ong, index) => {
        const isSelected = ong.name === selectedName
        return (
          <button
            key={ong.name}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(ong.name)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
              isSelected
                ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/15'
                : 'bg-white text-emerald-900 ring-1 ring-slate-200 hover:ring-emerald-300'
            }`}
          >
            <OngAvatar ong={ong} />
            {ong.name}
          </button>
        )
      })}
    </div>
  )
}

export default OngSelector
