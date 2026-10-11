import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

// Quando a página foi mandada para a impressão (botão "Exportar PDF" ou
// Ctrl+P). O flushSync grava a hora na tela antes de o navegador montar a
// folha; sem ele o cabeçalho sairia com a hora vazia
export function usePrintTimestamp() {
  const [printedAt, setPrintedAt] = useState(null)

  useEffect(() => {
    function handleBeforePrint() {
      flushSync(() => setPrintedAt(new Date()))
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    return () => window.removeEventListener('beforeprint', handleBeforePrint)
  }, [])

  return printedAt
}
