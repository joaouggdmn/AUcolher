import MatchPreferencesPanel from './MatchPreferencesPanel'

// Coluna de filtros à esquerda do deck, só no desktop (abaixo de lg o mesmo
// painel vira o MatchPreferencesDrawer). Abre e fecha pelo botão da página:
// a largura da coluna cresce de 0 até w-80 e empurra o deck para a direita,
// enquanto o painel desliza da esquerda. A largura é fixa para o conteúdo não
// se espremer durante a animação.
function MatchPreferencesSidebar({ isOpen, resultsCount, ...panelProps }) {
  return (
    <aside
      inert={!isOpen}
      aria-label="Filtros e preferências"
      className={`hidden shrink-0 transition-all duration-500 ease-out motion-reduce:transition-none lg:block ${
        isOpen ? 'lg:mr-8 lg:w-80' : 'lg:mr-0 lg:w-0'
      }`}
    >
      {/* Vidro translúcido no mesmo espírito da navbar: deixa o fundo
          emerald e os blurs decorativos aparecerem através do painel */}
      <div
        className={`sticky top-28 w-80 rounded-3xl border border-white/15 bg-emerald-950/40 p-6 shadow-2xl shadow-emerald-950/40 backdrop-blur-md transition-all duration-500 ease-out motion-reduce:transition-none ${
          isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'
        }`}
      >
        <h2 className="text-lg font-extrabold tracking-tight text-white">Filtros e preferências</h2>
        <p className="mb-4 text-xs text-emerald-200/60">
          {resultsCount} {resultsCount === 1 ? 'pet na sua fila' : 'pets na sua fila'}
        </p>

        <MatchPreferencesPanel {...panelProps} />
      </div>
    </aside>
  )
}

export default MatchPreferencesSidebar
