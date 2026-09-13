import { useEffect, useRef, useState } from 'react'
import { useGeolocation } from './useGeolocation'
import { forwardGeocode, reverseGeocode } from '../services/nominatimService'

function sanitizeCep(value) {
  return value.replace(/\D/g, '').slice(0, 8)
}

// onResolved recebe SEMPRE o mesmo formato, não importa a origem:
// { city, state, latitude, longitude, source: 'cep' | 'gps' }
// O componente que usa este hook não precisa saber COMO a localização
// foi obtida — só reage ao resultado final já normalizado.
export function useLocationCapture(onResolved) {
  const [cep, setCep] = useState('')
  const [cepStatus, setCepStatus] = useState('idle') // idle | loading | success | error
  const [cepError, setCepError] = useState(null)

  const { coords, isLocating, error: gpsError, requestLocation } = useGeolocation()
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)

  const lastLookedUpRef = useRef(null)
  const onResolvedRef = useRef(onResolved)

  useEffect(() => {
    onResolvedRef.current = onResolved
  }, [onResolved])

  // ── Caminho 1: CEP → ViaCEP → Nominatim (forward geocode) ──
  useEffect(() => {
    if (cep.length !== 8) {
      setCepStatus('idle')
      setCepError(null)
      return
    }
    if (lastLookedUpRef.current === cep) return

    let isCancelled = false

    async function lookup() {
      setCepStatus('loading')
      setCepError(null)

      try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        if (!viaCepResponse.ok) throw new Error('network-error')

        const viaCepData = await viaCepResponse.json()
        if (isCancelled) return

        if (viaCepData.erro) {
          setCepStatus('error')
          setCepError('CEP não encontrado. Verifique e tente novamente.')
          return
        }

        const address = {
          street: viaCepData.logradouro,
          neighborhood: viaCepData.bairro,
          city: viaCepData.localidade,
          state: viaCepData.uf,
        }

        lastLookedUpRef.current = cep
        setCepStatus('success')

        // Emenda com Nominatim: o payload final PRECISA conter
        // coordenadas de um jeito ou de outro, então encadeamos a
        // segunda chamada imediatamente após o ViaCEP resolver
        let coordsResult = null
        try {
          coordsResult = await forwardGeocode(address)
        } catch {
          coordsResult = null // Nominatim fora do ar não deve travar o fluxo do CEP
        }
        if (isCancelled) return

        onResolvedRef.current?.({
          city: address.city,
          state: address.state,
          latitude: coordsResult?.latitude ?? null,
          longitude: coordsResult?.longitude ?? null,
          source: 'cep',
        })
      } catch {
        if (!isCancelled) {
          setCepStatus('error')
          setCepError('Não foi possível buscar o CEP agora. Tente novamente.')
        }
      }
    }

    lookup()
    return () => {
      isCancelled = true
    }
  }, [cep])

  // ── Caminho 2: GPS → Nominatim (reverse geocode) ──
  useEffect(() => {
    if (!coords) return

    let isCancelled = false
    setIsReverseGeocoding(true)

    reverseGeocode(coords.latitude, coords.longitude)
      .then((address) => {
        if (isCancelled) return
        onResolvedRef.current?.({
          city: address.city,
          state: address.state,
          latitude: coords.latitude,
          longitude: coords.longitude,
          source: 'gps',
        })
      })
      .catch(() => {
        if (isCancelled) return
        // Mesmo se o reverse geocoding falhar, as coordenadas em si
        // são válidas e vieram direto do navegador — salvamos lat/lng
        // sem cidade/estado preenchidos, em vez de descartar tudo
        onResolvedRef.current?.({ city: '', state: '', latitude: coords.latitude, longitude: coords.longitude, source: 'gps' })
      })
      .finally(() => {
        if (!isCancelled) setIsReverseGeocoding(false)
      })

    return () => {
      isCancelled = true
    }
  }, [coords])

  function handleCepChange(rawValue) {
    setCep(sanitizeCep(rawValue))
  }

  return {
    cep,
    cepStatus,
    cepError,
    handleCepChange,
    requestGpsLocation: requestLocation,
    isLocatingGps: isLocating || isReverseGeocoding,
    gpsError,
  }
}