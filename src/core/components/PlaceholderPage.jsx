function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
          Página em desenvolvimento
        </p>
        <h1 className="mt-3 text-3xl font-black text-emerald-950">{title}</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Esta tela ainda precisa receber sua implementação final, mas a rota já
          está preparada para navegar sem quebrar a plataforma.
        </p>
      </div>
    </main>
  )
}

export default PlaceholderPage
