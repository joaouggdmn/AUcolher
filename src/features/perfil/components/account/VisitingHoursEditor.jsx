import { useEffect, useRef } from 'react'
import { FaPlus, FaTrashCan } from 'react-icons/fa6'
import { EMPTY_SLOT, MAX_VISITING_SLOTS, WEEKDAYS } from '../../utils/visitingHours'

const TIME_INPUT_CLASSES =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'

// Mensagem da validação nativa do form (o AccountFormShell chama
// checkValidity antes de salvar). '' = válido
function useCustomValidity(message) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.setCustomValidity(message)
  }, [message])
  return ref
}

function SlotRow({ slot, index, onChange, onRemove }) {
  const needsDays = slot.days.length === 0 && !slot.legacy
  const daysRef = useCustomValidity(needsDays ? 'Escolha ao menos um dia da semana.' : '')
  const closesRef = useCustomValidity(
    slot.opensAt && slot.closesAt && slot.closesAt <= slot.opensAt ? 'O horário de fechar deve ser depois do de abrir.' : ''
  )

  // Marcar um dia troca o texto antigo pelo que foi escolhido
  const toggleDay = (day) => {
    const days = slot.days.includes(day) ? slot.days.filter((d) => d !== day) : [...slot.days, day]
    onChange({ ...slot, days, legacy: null })
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 sm:gap-3">
      <div className="flex flex-1 flex-col gap-3">
        <fieldset className="relative">
          <legend className="mb-1.5 text-xs font-semibold text-slate-600">Dias</legend>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((weekday, day) => {
              const isSelected = slot.days.includes(day)
              return (
                <button
                  key={weekday.short}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={isSelected}
                  title={weekday.name}
                  className={`min-h-9 min-w-11 rounded-full border px-3 text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-800 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800'
                  }`}
                >
                  {weekday.short}
                </button>
              )
            })}
          </div>
          {/* Botão não entra na validação do form: este input invisível
              segura o "escolha ao menos um dia" no lugar dos chips */}
          <input
            ref={daysRef}
            tabIndex={-1}
            aria-hidden="true"
            value={slot.days.join(',')}
            onChange={() => {}}
            className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
          />
          {slot.legacy && (
            <p className="mt-2 text-xs text-amber-700">
              Antes: “{slot.legacy.days}, {slot.legacy.hours}”. Escolha os dias e o horário para atualizar.
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-600">Abre às</span>
            <input
              type="time"
              value={slot.opensAt}
              onChange={(e) => onChange({ ...slot, opensAt: e.target.value })}
              required={!slot.legacy}
              className={TIME_INPUT_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-600">Fecha às</span>
            <input
              ref={closesRef}
              type="time"
              value={slot.closesAt}
              onChange={(e) => onChange({ ...slot, closesAt: e.target.value })}
              required={!slot.legacy}
              className={TIME_INPUT_CLASSES}
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover horário ${index + 1}`}
        title="Remover"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-600"
      >
        <FaTrashCan size={14} />
      </button>
    </div>
  )
}

// Horário de visitas da ONG: cada faixa = dias marcados + abre/fecha, ou
// "Somente com agendamento". O texto que vai para o banco sai do
// toVisitingHourRows (utils/visitingHours.js)
function VisitingHoursEditor({ value, onChange }) {
  const { byAppointment, slots } = value

  const setSlots = (nextSlots) => onChange({ ...value, slots: nextSlots })
  const updateSlot = (index, slot) => setSlots(slots.map((current, i) => (i === index ? slot : current)))
  const removeSlot = (index) => setSlots(slots.filter((_, i) => i !== index))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={byAppointment}
          onChange={(e) => onChange({ ...value, byAppointment: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
        />
        <span>
          <span className="font-semibold">Visitas somente com agendamento</span>
          <span className="block text-xs text-slate-400">
            O perfil público mostra “Somente com agendamento” no lugar dos horários.
          </span>
        </span>
      </label>

      {!byAppointment && (
        <>
          {slots.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-400">
              Nenhum horário cadastrado. Adicione os dias e horários em que a instituição recebe visitas.
            </p>
          )}

          {slots.map((slot, index) => (
            // Estado controlado: a key por índice não embaralha valores ao remover
            <SlotRow
              key={index}
              slot={slot}
              index={index}
              onChange={(next) => updateSlot(index, next)}
              onRemove={() => removeSlot(index)}
            />
          ))}

          {slots.length < MAX_VISITING_SLOTS && (
            <button
              type="button"
              onClick={() => setSlots([...slots, EMPTY_SLOT])}
              className="flex items-center justify-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <FaPlus size={12} />
              Adicionar horário
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default VisitingHoursEditor
