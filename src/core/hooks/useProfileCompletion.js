import { useMemo } from 'react'

const CHECKLIST_DEFINITIONS = [
  { key: 'nome', label: 'Nome completo', check: (p) => !!p?.name?.trim() },
  { key: 'email', label: 'E-mail', check: (p) => !!p?.email?.trim() },
  { key: 'telefone', label: 'Telefone', check: (p) => !!p?.telefone?.trim() },
  { key: 'localizacao', label: 'Localização', check: (p) => !!p?.cidade?.trim() && !!p?.estado },
  {
    key: 'estiloDeVida',
    label: 'Perfil AUmatch',
    check: (p) =>
      !!p?.moradia && !!p?.rotinaExercicio && !!p?.tempoSozinho &&
      p?.temCriancasOuPets !== null && p?.temCriancasOuPets !== undefined,
  },
]

// Consumido pela Navbar (com o `user` persistido do AuthContext) e pela
// UserProfilePage (com o rascunho `formData` em edição) — mesma matemática,
// duas fontes de dados com o mesmo formato de campos.
export function useProfileCompletion(profile) {
  return useMemo(() => {
    const checklist = CHECKLIST_DEFINITIONS.map((item) => ({
      key: item.key,
      label: item.label,
      isComplete: item.check(profile),
    }))

    const percentage = Math.round(
      (checklist.filter((item) => item.isComplete).length / checklist.length) * 100
    )

    return { checklist, percentage }
  }, [profile])
}