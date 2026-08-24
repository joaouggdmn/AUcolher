import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa6'

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-bold text-emerald-900"
      >
        {title}
        <FaChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  )
}

export default CollapsibleSection