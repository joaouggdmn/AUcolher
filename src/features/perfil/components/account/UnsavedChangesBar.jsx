import { FaCircleExclamation, FaFloppyDisk } from 'react-icons/fa6'

// Fica fixa no rodapé só enquanto há alterações: o formulário é longo e
// a barra evita rolar até o fim para salvar. O submit usa o atributo `form`
// para disparar a mesma validação nativa do <form>. Se a API recusar o
// salvamento, o motivo aparece aqui mesmo, no lugar do aviso
function UnsavedChangesBar({ formId, onDiscard, isSaving = false, errorMessage = null }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 animate-fade-slide-in px-4">
      <div
        role="status"
        className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl bg-emerald-950 px-5 py-4 text-white shadow-2xl shadow-emerald-950/30 ring-1 ring-emerald-800 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="flex items-start gap-2.5 text-sm">
          <FaCircleExclamation
            size={15}
            className={`mt-0.5 shrink-0 ${errorMessage ? 'text-rose-300' : 'text-amber-300'}`}
          />
          {errorMessage ? (
            <span role="alert">
              <span className="font-bold">Não foi possível salvar.</span>{' '}
              <span className="text-rose-100">{errorMessage}</span>
            </span>
          ) : (
            <span>
              <span className="font-bold">Alterações não salvas.</span>{' '}
              <span className="text-emerald-100/70">Elas só aparecem no perfil público depois de salvar.</span>
            </span>
          )}
        </p>

        <div className="flex shrink-0 gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="rounded-full px-4 py-2 text-sm font-bold text-emerald-100 transition-colors duration-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-emerald-950 transition-all duration-300 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
            ) : (
              <FaFloppyDisk size={13} />
            )}
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesBar
