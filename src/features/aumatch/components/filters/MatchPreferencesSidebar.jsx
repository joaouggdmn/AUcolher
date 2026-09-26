import MatchPreferencesPanel from './MatchPreferencesPanel'

// Coluna de ~30% da largura, sticky abaixo do navbar fixo. Só aparece no
// desktop — abaixo de lg o mesmo painel vira o MatchPreferencesDrawer
function MatchPreferencesSidebar({ resultsCount, ...panelProps }) {
  return (
    <aside className="hidden shrink-0 lg:block lg:w-[30%] lg:max-w-sm">
      {/* Vidro translúcido no mesmo espírito da navbar: deixa o fundo
          emerald e os blurs decorativos aparecerem através do painel */}
      <div className="sticky top-28 rounded-3xl border border-white/15 bg-emerald-950/40 p-6 shadow-2xl shadow-emerald-950/40 backdrop-blur-md">
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
