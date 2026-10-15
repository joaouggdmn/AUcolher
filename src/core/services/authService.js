import api, { ACCOUNT_SUSPENDED_MESSAGE } from "./api";
import { mockHttpError } from "./mock/mockStore";
import { isAccountBanned } from "../../features/admin/services/moderationMock";
import { instagramUrl, normalizeFacebookUrl, xUrl } from "../utils/socialLinks";
import { maskCEP } from "../utils/masks";
import { parseFoundedYear } from "../utils/foundedYear";

function buildRegisterEndpoint(userType) {
  return userType === "ONG" ? "/auth/register/ngo" : "/auth/register/person";
}

// Backend usa NGO | PERSON; o frontend trabalha com PESSOA | ONG | ADMIN
// (docs/regras-de-negocio.md, seção 2)
function normalizeUserType(apiUserType) {
  if (apiUserType === "NGO") return "ONG";
  return apiUserType === "ADMIN" ? "ADMIN" : "PESSOA";
}

function emptyToNull(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toRegisterPayload(formData) {
  const basePayload = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    photoUrl: formData.photoUrl ?? null,
  };

  if (formData.userType !== "ONG") {
    return basePayload;
  }

  // Espelha o NgoRegistrationDTO — o backend limpa máscaras (CNPJ/CEP) e o @
  return {
    ...basePayload,
    cnpj: formData.cnpj,
    bio: emptyToNull(formData.bio),
    instagram: emptyToNull(formData.instagram),
    twitter: emptyToNull(formData.twitter),
    facebook: emptyToNull(normalizeFacebookUrl(formData.facebook)),
    foundedYear: parseFoundedYear(formData.foundedYear),
    cep: emptyToNull(formData.cep),
    street: emptyToNull(formData.street),
    number: emptyToNull(formData.number),
    complement: emptyToNull(formData.complement),
    district: emptyToNull(formData.district),
    city: emptyToNull(formData.city),
    state: emptyToNull(formData.uf),
  };
}

// Mesmo formato de endereço do perfil público (OngDetails): a API manda o
// endereço solto, a tela usa um objeto `address`
function toFrontendAddress(backendUser) {
  if (!backendUser.street) return null;

  return {
    street: backendUser.street,
    number: backendUser.number ?? "",
    complement: backendUser.complement ?? "",
    district: backendUser.district ?? "",
    city: backendUser.city ?? "",
    state: backendUser.state ?? "",
    cep: maskCEP(backendUser.cep ?? ""),
  };
}

// Tudo o que o banco guarda, já no formato do frontend — é também o que o
// PUT /users/me devolve depois de salvar "Minha conta"
export function toFrontendProfile(backendUser) {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    userType: normalizeUserType(backendUser.userType),
    // "Membro desde [ano]" (pessoa) e "Fundada em [ano]" (ONG) no perfil
    memberSince: backendUser.createdAt ?? null,
    foundedYear: backendUser.foundedYear ?? null,
    photoUrl: backendUser.photoUrl ?? null,
    bio: backendUser.bio ?? "",
    isVerified: backendUser.isVerified ?? false,
    // Conta do Google sem senha: "Criar senha" em vez de "Alterar senha".
    // A API ainda não manda o campo; sem ele, a conta tem senha
    hasPassword: backendUser.hasPassword ?? true,
    // Perfil de ONG — socialLinks/address no formato do perfil público
    cnpj: backendUser.cnpj ?? null,
    socialLinks: {
      instagram: instagramUrl(backendUser.instagram),
      x: xUrl(backendUser.twitter),
      facebook: backendUser.facebook ?? null,
    },
    address: toFrontendAddress(backendUser),
    // Mesmo formato das linhas do RowsEditor (função vazia vira '', não null)
    team: (backendUser.team ?? []).map((member) => ({ name: member.name, role: member.role ?? '' })),
    visitingHours: backendUser.visitingHours ?? [],
    city: backendUser.city ?? '',
    state: backendUser.state ?? '',
  }
}

function toFrontendUser(backendUser) {
  return {
    ...toFrontendProfile(backendUser),
    // As respostas do Perfil AUmatch vêm de outra rota (GET /match/profile):
    // começam vazias e o AuthContext completa no login
    moradia: '',
    rotinaExercicio: '',
    tempoForaCasa: '',
    convivencia: null,
    speciesPreference: null,
    idealPetProfile: null,
    portePreferido: null,
    // 🆕 Mapeamento de 'telefone' removido — a coluna telefone_whatsapp
    // deixa de existir no banco (ver ALTER TABLE na Parte 2)
  }
}

export { ACCOUNT_SUSPENDED_MESSAGE };

// Rota única para qualquer tipo de conta — o papel vem em user.userType
export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  const user = toFrontendUser(data.user);

  // 🔴 Moderação no modo mock: a API ainda não sabe quem o admin baniu. Com
  // o backend, a conta banida fica com `active = false` e o próprio login recusa
  if (isAccountBanned(user)) throw mockHttpError(403, ACCOUNT_SUSPENDED_MESSAGE);

  // Formato da API: { token, type, user }
  return {
    token: data.token,
    tokenType: data.type ?? "Bearer",
    user,
  };
}

export async function registerRequest(formData) {
  const endpoint = buildRegisterEndpoint(formData.userType);
  const payload = toRegisterPayload(formData);

  const { data } = await api.post(endpoint, payload);

  return data?.user ? toFrontendUser(data.user) : null;
}
