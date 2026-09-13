import { useMemo } from 'react'

const CHECKLIST_DEFINITIONS = [
  { key: 'nome', label: 'Nome completo', check: (p) => !!p?.name?.trim() },
  { key: 'email', label: 'E-mail', check: (p) => !!p?.email?.trim() },
  { key: 'localizacao', label: 'Localização', check: (p) => !!p?.cidade?.trim() && !!p?.estado },
  {
    key: 'estiloDeVida',
    label: 'Perfil AUmatch',
    check: (p) =>
      !!p?.moradia &&
      !!p?.rotinaExercicio &&
      !!p?.tempoForaCasa &&
      p?.temCriancasOuPets !== null &&
      p?.temCriancasOuPets !== undefined &&
      !!p?.speciesPreference &&
      !!p?.idealPetProfile &&
      !!p?.portePreferido, // 🆕 pelagemPreferida removido daqui
  },
]

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