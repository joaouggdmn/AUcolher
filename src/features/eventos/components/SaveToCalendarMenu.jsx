import { FaRegCalendarPlus, FaGoogle, FaMicrosoft, FaApple } from 'react-icons/fa6'
import { formatEventAddress } from '../utils/eventDisplay'

// "2026-10-03" + "09:00" → "20261003T090000"
function toCalendarStamp(date, time) {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
}

// Sem término cadastrado, reserva 1 hora na agenda
function oneHourLater(time) {
  const [hours, minutes] = time.split(':').map(Number)
  if (hours >= 23) return '23:59'
  return `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function buildGoogleCalendarUrl(event) {
  const { title, description, date, startTime, endTime, location } = event
  const start = toCalendarStamp(date, startTime)
  const end = toCalendarStamp(date, endTime ?? oneHourLater(startTime))

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    // Horário sem fuso é o local do evento, não o de quem salva
    ctz: 'America/Sao_Paulo',
    details: description,
    location: `${location.venue}, ${formatEventAddress(location)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function SaveToCalendarMenu({ event, isOpen, onToggle }) {
  const handleOption = (provider) => {
    if (provider === 'google') {
      window.open(buildGoogleCalendarUrl(event), '_blank')
    } else {
      // 🔴 Outlook e iCal exigem geração de arquivo .ics — normalmente feito no backend
      console.log(`Adicionar ao ${provider}:`, event.title)
    }
    onToggle(false)
  }

  return (
    <div className="relative isolate">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        title="Salvar no calendário"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 hover:border-emerald-300 hover:text-emerald-700"
      >
        <FaRegCalendarPlus size={15} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onToggle(false)} />

          <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-emerald-950/10">
            <button
              type="button"
              onClick={() => handleOption('google')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaGoogle size={14} className="text-slate-400" />
              Google Calendar
            </button>
            <button
              type="button"
              onClick={() => handleOption('outlook')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaMicrosoft size={14} className="text-slate-400" />
              Outlook
            </button>
            <button
              type="button"
              onClick={() => handleOption('ical')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaApple size={14} className="text-slate-400" />
              iCal
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SaveToCalendarMenu