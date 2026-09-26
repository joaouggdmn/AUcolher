import { FaEye, FaLock } from 'react-icons/fa6'

// Deixa explícito, em cada bloco de "Minha conta", se aquilo compõe a
// vitrine pública ou é dado privado da conta
const VARIANTS = {
  public: { icon: FaEye, label: 'Público', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
  private: { icon: FaLock, label: 'Só você vê', className: 'bg-slate-100 text-slate-500' },
}

function VisibilityChip({ visibility, className = '' }) {
  const { icon: Icon, label, className: variantClassName } = VARIANTS[visibility]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${variantClassName} ${className}`}
    >
      <Icon size={10} />
      {label}
    </span>
  )
}

export default VisibilityChip
