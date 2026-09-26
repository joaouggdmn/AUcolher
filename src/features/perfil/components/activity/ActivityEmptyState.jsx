import { Link } from 'react-router-dom'

function ActivityEmptyState({ icon: Icon, title, description, action }) {
  const ActionIcon = action?.icon

  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Icon size={18} />
      </span>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {description && <p className="max-w-sm text-xs text-slate-400">{description}</p>}
      {action && (
        <Link
          to={action.to}
          className="mt-3 flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          {ActionIcon && <ActionIcon size={12} />}
          {action.label}
        </Link>
      )}
    </div>
  )
}

export default ActivityEmptyState
