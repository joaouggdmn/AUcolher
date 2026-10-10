import { useEffect, useState } from 'react'

// Segundos que faltam até `targetIso` (LocalDateTime sem fuso = hora local),
// atualizados a cada segundo. Nunca fica negativo
export function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!targetIso) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [targetIso])

  if (!targetIso) return 0
  return Math.max(0, Math.floor((new Date(targetIso).getTime() - now) / 1000))
}

export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
