import { useEffect, useRef, useState } from 'react'
import { fetchCompanyByCnpj } from '../../../core/services/brasilApiService'
import { isValidCNPJ, sanitizeCNPJ } from '../../../core/utils/cnpj'

const LOOKUP_ERROR_MESSAGES = {
  'cnpj-not-found': 'CNPJ não encontrado na Receita Federal. Preencha os dados manualmente.',
  default: 'Não foi possível consultar o CNPJ agora. Preencha os dados manualmente.',
}

// Busca disparada pelo componente (onBlur), não por effect: só consulta a
// BrasilAPI quando o usuário termina de digitar. onResolved fica em ref pelo
// mesmo motivo do useCepLookup — função inline do pai não dispara buscas
export function useCnpjLookup(onResolved) {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState(null)
  const [company, setCompany] = useState(null)

  const onResolvedRef = useRef(onResolved)
  const lastResolvedRef = useRef(null)
  // Cada busca ganha um id; respostas de buscas já superadas (CNPJ editado,
  // componente desmontado) são descartadas
  const requestIdRef = useRef(0)

  useEffect(() => {
    onResolvedRef.current = onResolved
  }, [onResolved])

  useEffect(() => {
    const requestIds = requestIdRef
    return () => {
      requestIds.current += 1
    }
  }, [])

  async function lookup(value) {
    const cnpj = sanitizeCNPJ(value)
    if (!cnpj) return reset()

    if (!isValidCNPJ(cnpj)) {
      requestIdRef.current += 1
      setStatus('error')
      setErrorMessage(
        cnpj.length < 14 ? 'CNPJ incompleto: são 14 dígitos.' : 'CNPJ inválido. Confira os números digitados.'
      )
      return
    }

    // Mesmo CNPJ já preenchido: não refaz a busca nem sobrescreve o que o
    // usuário ajustou manualmente depois do autopreenchimento
    if (lastResolvedRef.current === cnpj) {
      setStatus('success')
      setErrorMessage(null)
      return
    }

    const requestId = ++requestIdRef.current
    setStatus('loading')
    setErrorMessage(null)

    try {
      const result = await fetchCompanyByCnpj(cnpj)
      if (requestId !== requestIdRef.current) return

      lastResolvedRef.current = cnpj
      setCompany(result)
      setStatus('success')
      onResolvedRef.current?.(result)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      setStatus('error')
      setErrorMessage(LOOKUP_ERROR_MESSAGES[error.message] ?? LOOKUP_ERROR_MESSAGES.default)
    }
  }

  function reset() {
    requestIdRef.current += 1
    setStatus('idle')
    setErrorMessage(null)
  }

  return { status, errorMessage, company, lookup, reset }
}
