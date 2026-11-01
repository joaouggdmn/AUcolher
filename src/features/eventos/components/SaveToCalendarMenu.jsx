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
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-500 transition-all duration-300 hover:border-brand-200 hover:text-brand-600"
      >
        <FaRegCalendarPlus size={15} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onToggle(false)} />

          <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-card border border-line bg-white py-1.5 shadow-float ">
            <button
              type="button"
              onClick={() => handleOption('google')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-brand-50"
            >
              <FaGoogle size={14} className="text-ink-500" />
              Google Calendar
            </button>
            <button
              type="button"
              onClick={() => handleOption('outlook')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-brand-50"
            >
              <FaMicrosoft size={14} className="text-ink-500" />
              Outlook
            </button>
            <button
              type="button"
              onClick={() => handleOption('ical')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-brand-50"
            >
              <FaApple size={14} className="text-ink-500" />
              iCal
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SaveToCalendarMenu