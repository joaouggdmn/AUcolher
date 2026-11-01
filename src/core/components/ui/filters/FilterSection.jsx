function FilterSection({ title, children }) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </div>
  )
}

export default FilterSection