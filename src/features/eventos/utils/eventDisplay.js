// "Rua Caetano Lummertz, 850 (Portão lateral) - Cidade Alta, Araranguá - SC"
// Campos opcionais vazios somem sem deixar vírgula ou traço sobrando
export function formatEventAddress({ street, number, complement, district, city, state }) {
  const streetLine = [street, number].filter(Boolean).join(', ')
  const withComplement = complement ? `${streetLine} (${complement})` : streetLine
  const neighborhood = [withComplement, district].filter(Boolean).join(' - ')
  const cityLine = [city, state].filter(Boolean).join(' - ')
  return [neighborhood, cityLine].filter(Boolean).join(', ')
}

export function buildMapsUrl(location) {
  const query = [location.venue, formatEventAddress({ ...location, complement: '' })].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function plural(count, singular, pluralLabel) {
  return `${count} ${count === 1 ? singular : pluralLabel}`
}

// Linha de lotação do card e do detalhe. `tone` destaca quando está acabando
export function getAttendanceSummary(event) {
  const confirmed = plural(event.confirmedCount, 'confirmado', 'confirmados')

  if (event.capacity == null) {
    return {
      label: event.confirmedCount === 0 ? 'Seja o primeiro a confirmar' : confirmed,
      tone: 'neutral',
    }
  }
  if (event.isFull) return { label: `${confirmed} · lotado`, tone: 'full' }

  return {
    label: `${confirmed} · ${plural(event.spotsLeft, 'vaga restante', 'vagas restantes')}`,
    tone: event.spotsLeft <= 3 ? 'few' : 'neutral',
  }
}
