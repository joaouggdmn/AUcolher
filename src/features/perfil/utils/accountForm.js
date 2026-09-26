import {
  instagramUrl,
  normalizeFacebookUrl,
  sanitizeInstagramHandle,
  sanitizeXHandle,
  xUrl,
} from '../../../core/utils/socialLinks'
import { parseFoundedYear } from '../../../core/utils/foundedYear'

// Cada tipo de conta tem um par de funções:
//   build*(user)      → campos editáveis do formulário de "Minha conta"
//   to*Updates(form)  → patch normalizado que vai para o updateProfile,
//                       no mesmo formato do usuário logado (toFrontendUser)

function trimStrings(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  )
}

// Linha totalmente em branco (clicou em "adicionar" e não preencheu) é descartada
function cleanRows(rows) {
  return rows.map(trimStrings).filter((row) => Object.values(row).some(Boolean))
}

// ── Pessoa física ──────────────────────────────────────────────

export function buildPersonForm(user) {
  return {
    name: user?.name ?? '',
    photoUrl: user?.photoUrl ?? null,
    bio: user?.bio ?? '',
    cidade: user?.cidade ?? '',
    estado: user?.estado ?? '',
    latitude: user?.latitude ?? null, // 🆕 oculto — nunca vira input visível
    longitude: user?.longitude ?? null, // 🆕
    moradia: user?.moradia ?? '',
    rotinaExercicio: user?.rotinaExercicio ?? '',
    tempoForaCasa: user?.tempoForaCasa ?? '',
    temCriancasOuPets: user?.temCriancasOuPets ?? null,
    speciesPreference: user?.speciesPreference ?? null,
    idealPetProfile: user?.idealPetProfile ?? null,
    portePreferido: user?.portePreferido ?? null,
  }
}

export function toPersonUpdates(form) {
  return {
    ...form,
    name: form.name.trim(),
    bio: form.bio.trim(),
    cidade: form.cidade.trim(),
  }
}

// ── ONG ────────────────────────────────────────────────────────

// Input do ano de fundação — o atalho do topo de "Minha conta" rola até ele
export const FOUNDED_YEAR_FIELD_ID = 'account-founded-year'

const EMPTY_ADDRESS = { cep: '', street: '', number: '', complement: '', district: '', city: '', state: '' }

export function buildOngForm(user) {
  return {
    name: user?.name ?? '',
    photoUrl: user?.photoUrl ?? null,
    bio: user?.bio ?? '',
    institutionalEmail: user?.institutionalEmail ?? '',
    // Texto, como todo input controlado — volta a ser número no toOngUpdates
    foundedYear: user?.foundedYear != null ? String(user.foundedYear) : '',
    // Redes editadas como @usuario, igual ao cadastro; o perfil guarda o link
    instagram: sanitizeInstagramHandle(user?.socialLinks?.instagram ?? ''),
    twitter: sanitizeXHandle(user?.socialLinks?.x ?? ''),
    facebook: user?.socialLinks?.facebook ?? '',
    // ONG sem logradouro no backend ainda pode ter cidade/UF soltas. Nulos
    // viram '' para os inputs continuarem controlados
    address: {
      ...EMPTY_ADDRESS,
      city: user?.cidade ?? '',
      state: user?.estado ?? '',
      ...Object.fromEntries(Object.entries(user?.address ?? {}).filter(([, value]) => value != null)),
    },
    visitingHours: user?.visitingHours ?? [],
    team: user?.team ?? [],
  }
}

export function toOngUpdates(form) {
  const address = trimStrings(form.address)

  return {
    name: form.name.trim(),
    photoUrl: form.photoUrl,
    bio: form.bio.trim(),
    institutionalEmail: form.institutionalEmail.trim() || null,
    foundedYear: parseFoundedYear(form.foundedYear),
    socialLinks: {
      instagram: instagramUrl(form.instagram),
      x: xUrl(form.twitter),
      facebook: normalizeFacebookUrl(form.facebook) || null,
    },
    // Sem logradouro o bloco "Visitas" do perfil público não tem o que mostrar
    address: address.street ? address : null,
    // Cidade/UF da ONG = sede: é o que os anúncios dela e a busca por distância usam
    cidade: address.city,
    estado: address.state,
    visitingHours: cleanRows(form.visitingHours),
    team: cleanRows(form.team),
  }
}

// Corpo do PUT /usuarios/me (AtualizacaoPerfilDTO no backend): espelha as
// colunas de docs/script_banco_aucolher.sql em camelCase, como o CadastroOngDTO.
// É uma substituição completa — passe o usuário inteiro já com as alterações
export function toApiPayload(updates, userType) {
  const basePayload = {
    nome: updates.name,
    fotoUrl: updates.photoUrl ?? null,
    bio: updates.bio || null,
  }

  if (userType !== 'ONG') {
    return {
      ...basePayload,
      cep: updates.cep?.replace(/\D/g, '') || null,
      cidade: updates.cidade || null,
      estado: updates.estado || null,
      // Ainda sem coluna no banco: o backend ignora, e o AuthContext guarda
      // coordenadas e Perfil AUmatch localmente
      latitude: updates.latitude,
      longitude: updates.longitude,
      perfilAumatch: {
        tipoMoradia: updates.moradia,
        rotinaExercicios: updates.rotinaExercicio,
        tempoForaCasa: updates.tempoForaCasa,
        temCriancasOuPets: updates.temCriancasOuPets,
        especiePreferida: updates.speciesPreference,
        perfilPetIdeal: updates.idealPetProfile,
        portePreferido: updates.portePreferido,
      },
    }
  }

  const address = updates.address ?? EMPTY_ADDRESS

  return {
    ...basePayload,
    emailInstitucional: updates.institutionalEmail,
    anoFundacao: updates.foundedYear ?? null,
    instagram: sanitizeInstagramHandle(updates.socialLinks.instagram ?? '') || null,
    twitter: sanitizeXHandle(updates.socialLinks.x ?? '') || null,
    facebook: updates.socialLinks.facebook,
    cep: (address.cep ?? '').replace(/\D/g, '') || null,
    logradouro: address.street || null,
    numero: address.number || null,
    complemento: address.complement || null,
    bairro: address.district || null,
    cidade: updates.cidade || null,
    estado: updates.estado || null,
    // A ordem da lista é a ordem de exibição no perfil (coluna "ordem" no banco)
    equipe: updates.team.map((member) => ({ nome: member.name, funcao: member.role || null })),
    horariosVisita: updates.visitingHours.map((slot) => ({ dias: slot.days, horario: slot.hours })),
  }
}
