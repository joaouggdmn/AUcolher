import { useCallback, useState } from 'react'

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Seu navegador não suporta geolocalização.')
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
      },
      (err) => {
        setIsLocating(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Você negou o acesso à localização. Ative a permissão do navegador para usar essa função.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Não foi possível determinar sua localização no momento.')
            break
          case err.TIMEOUT:
            setError('A busca pela sua localização demorou demais. Tente novamente.')
            break
          default:
            setError('Ocorreu um erro ao tentar obter sua localização.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  return { coords, isLocating, error, requestLocation }
}