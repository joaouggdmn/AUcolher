function ProfileSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-card border border-line bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-brand-950">{title}</h2>
          {description && <p className="text-sm text-ink-500">{description}</p>}
        </div>
      </div>

      {children}
    </section>
  )
}

export default ProfileSection