function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <div className="rounded-card border border-line bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-normal text-brand-600">
          Pagina em desenvolvimento
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink-900">{title}</h1>
        <p className="mt-4 max-w-2xl text-ink-600">
          Esta tela ainda precisa receber sua implementacao final, mas a rota ja
          esta preparada para navegar sem quebrar a plataforma.
        </p>
      </div>
    </main>
  )
}

export default PlaceholderPage
