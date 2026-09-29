import { useCallback, useMemo, useState } from 'react'
import { EXAMPLE_PROFILE, SIM_KEYS, isAnswered } from '../data/exampleProfile'

function pickAnswered(user) {
  return Object.fromEntries(SIM_KEYS.filter((key) => isAnswered(user?.[key])).map((key) => [key, user[key]]))
}

// Perfil que alimenta o simulador e o card do hero. Só as edições
// ("overrides") viram estado: a base é derivada da persona a cada render,
// então quando a sessão termina de carregar o perfil já nasce certo, sem
// effect de sincronização. Nada daqui é salvo — nunca chama updateProfile
export function useMatchProfile({ kind, user }) {
  const [overrides, setOverrides] = useState({})

  // Com o quiz completo, pickAnswered cobre todas as chaves e o exemplo some;
  // com o quiz pela metade, o exemplo só preenche o que falta
  const base = useMemo(
    () => (kind === 'matched' || kind === 'pending' ? { ...EXAMPLE_PROFILE, ...pickAnswered(user) } : EXAMPLE_PROFILE),
    [kind, user]
  )

  const profile = useMemo(() => ({ ...base, ...overrides }), [base, overrides])

  const setAnswer = useCallback((key, value) => {
    setOverrides((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setOverrides({}), [])

  // Pergunta cuja resposta ainda vem do perfil de exemplo — o simulador
  // marca com a etiqueta "exemplo" para ninguém achar que é resposta sua
  const exampleKeys =
    kind === 'matched' ? [] : kind === 'pending' ? SIM_KEYS.filter((key) => !isAnswered(user?.[key])) : SIM_KEYS

  const source = kind === 'matched' ? 'quiz' : kind === 'pending' ? 'mixed' : 'example'

  return {
    profile,
    setAnswer,
    reset,
    isDirty: Object.keys(overrides).some((key) => overrides[key] !== base[key]),
    source,
    exampleKeys,
  }
}
