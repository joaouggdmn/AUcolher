import VisibilityChip from './VisibilityChip'

// Abre cada grupo do formulário: "Perfil público" x "Dados da conta"
function AccountGroupHeading({ visibility, title, description, children }) {
  return (
    <div className="mt-4 flex flex-col gap-3 first:mt-0 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <VisibilityChip visibility={visibility} />
        <h2 className="mt-2 text-xl font-black tracking-tight text-emerald-950">{title}</h2>
        <p className="mt-0.5 max-w-xl text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default AccountGroupHeading
