import { useMemo } from 'react'

const PERSON_CHECKLIST = [
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

// ONG não passa pelo questionário do AUmatch: o que conta é o perfil
// institucional da seção 6.2 das regras de negócio
const ONG_CHECKLIST = [
  { key: 'nome', label: 'Nome da instituição', check: (p) => !!p?.name?.trim() },
  { key: 'logo', label: 'Logo', check: (p) => !!p?.photoUrl },
  { key: 'bio', label: 'Sobre a instituição', check: (p) => !!p?.bio?.trim() },
  { key: 'endereco', label: 'Endereço', check: (p) => !!p?.address?.street && !!p?.address?.city },
  { key: 'visitas', label: 'Horário de visitas', check: (p) => (p?.visitingHours?.length ?? 0) > 0 },
  {
    key: 'contato',
    label: 'Contato ou redes',
    check: (p) => !!p?.institutionalEmail || Object.values(p?.socialLinks ?? {}).some(Boolean),
  },
]

export function useProfileCompletion(profile) {
  return useMemo(() => {
    const definitions = profile?.userType === 'ONG' ? ONG_CHECKLIST : PERSON_CHECKLIST

    const checklist = definitions.map((item) => ({
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
