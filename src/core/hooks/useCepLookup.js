import { useEffect, useRef, useState } from 'react'
import { fetchAddressByCep } from '../services/viaCepService'

function sanitizeCep(value) {
  return value.replace(/\D/g, '').slice(0, 8)
}

// onResolved é chamado com { city, state, street, neighborhood } assim que
// a API confirma um CEP válido. Guardado em ref (não em dependência do
// effect) para que uma função inline recriada a cada render do componente
// pai não dispare buscas repetidas.
export function useCepLookup(onResolved) {
  const [cep, setCep] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState(null)

  const lastLookedUpRef = useRef(null)
  const onResolvedRef = useRef(onResolved)

  useEffect(() => {
    onResolvedRef.current = onResolved
  }, [onResolved])

  useEffect(() => {
    if (cep.length !== 8) {
      setStatus('idle')
      setErrorMessage(null)
      return
    }

    if (lastLookedUpRef.current === cep) return // já buscamos esse CEP, evita refetch

    let isCancelled = false

    async function lookup() {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const address = await fetchAddressByCep(cep)
        if (isCancelled) return

        if (!address) {
          setStatus('error')
          setErrorMessage('CEP não encontrado. Verifique e tente novamente.')
          return
        }

        lastLookedUpRef.current = cep
        setStatus('success')
        onResolvedRef.current?.(address)
      } catch {
        if (!isCancelled) {
          setStatus('error')
          setErrorMessage('Não foi possível buscar o CEP agora. Tente novamente.')
        }
      }
    }

    lookup()

    return () => {
      isCancelled = true
    }
  }, [cep])

  function handleCepChange(rawValue) {
    setCep(sanitizeCep(rawValue))
  }

  return { cep, status, errorMessage, handleCepChange }
}