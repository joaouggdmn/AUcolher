import { FaArrowRotateLeft, FaXmark } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'

// Com o painel de preferências, a fila pode acabar por dois motivos bem
// diferentes: o usuário viu todo mundo, ou os filtros estão apertados demais.
// O texto e o botão principal mudam de acordo.
function EmptyStackState({ onReset, hasActiveFilters, onClearFilters }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-emerald-200 bg-white/60 p-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <LuSparkles size={26} />
      </span>

      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-emerald-950">
          {hasActiveFilters ? 'Nenhum pet com esses filtros' : 'Você viu todo mundo por agora!'}
        </h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          {hasActiveFilters
            ? 'Tente ampliar o raio de distância ou liberar os filtros de convivência.'
            : 'Volte mais tarde para novos pets, ou reveja os perfis que já passaram.'}
        </p>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          <FaXmark size={13} />
          Limpar preferências
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          <FaArrowRotateLeft size={13} />
          Recomeçar
        </button>
      )}
    </div>
  )
}

export default EmptyStackState
