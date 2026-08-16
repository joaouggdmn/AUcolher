function ProfileSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="font-serif text-lg font-bold text-emerald-950">{title}</h2>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>

      {children}
    </section>
  )
}

export default ProfileSection