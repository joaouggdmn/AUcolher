import api from "./api";
import { instagramUrl, normalizeFacebookUrl, xUrl } from "../utils/socialLinks";
import { maskCEP } from "../utils/masks";
import { parseFoundedYear } from "../utils/foundedYear";

function buildRegisterEndpoint(userType) {
  return userType === "ONG" ? "/auth/register/ong" : "/auth/register/user";
}

// Backend usa ONG | USUARIO_COMUM; o frontend trabalha com PESSOA | ONG | ADMIN
// (docs/regras-de-negocio.md, seção 2)
function normalizeUserType(tipoUsuario) {
  return tipoUsuario === "ONG" || tipoUsuario === "ADMIN" ? tipoUsuario : "PESSOA";
}

function emptyToNull(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toRegisterPayload(formData) {
  const basePayload = {
    nome: formData.name,
    email: formData.email,
    senha: formData.password,
    fotoUrl: formData.photoUrl ?? null,
  };

  if (formData.userType !== "ONG") {
    return basePayload;
  }

  // Espelha o CadastroOngDTO — o backend limpa máscaras (CNPJ/CEP) e o @
  return {
    ...basePayload,
    cnpj: formData.cnpj,
    bio: emptyToNull(formData.bio),
    instagram: emptyToNull(formData.instagram),
    twitter: emptyToNull(formData.twitter),
    facebook: emptyToNull(normalizeFacebookUrl(formData.facebook)),
    anoFundacao: parseFoundedYear(formData.foundedYear),
    cep: emptyToNull(formData.cep),
    logradouro: emptyToNull(formData.street),
    numero: emptyToNull(formData.number),
    complemento: emptyToNull(formData.complement),
    bairro: emptyToNull(formData.district),
    cidade: emptyToNull(formData.city),
    estado: emptyToNull(formData.uf),
  };
}

// Mesmo formato de endereço do perfil público (OngDetails)
function toFrontendAddress(backendUser) {
  if (!backendUser.logradouro) return null;

  return {
    street: backendUser.logradouro,
    number: backendUser.numero ?? "",
    complement: backendUser.complemento ?? "",
    district: backendUser.bairro ?? "",
    city: backendUser.cidade ?? "",
    state: backendUser.estado ?? "",
    cep: maskCEP(backendUser.cep ?? ""),
  };
}

// Tudo o que o banco guarda, já no formato do frontend — é também o que o
// PUT /usuarios/me devolve depois de salvar "Minha conta"
export function toFrontendProfile(backendUser) {
  return {
    id: backendUser.id,
    name: backendUser.nome,
    email: backendUser.email,
    userType: normalizeUserType(backendUser.tipoUsuario),
    // "Membro desde [ano]" (pessoa) e "Fundada em [ano]" (ONG) no perfil
    memberSince: backendUser.dataCriacao ?? null,
    foundedYear: backendUser.anoFundacao ?? null,
    photoUrl: backendUser.fotoUrl ?? null,
    bio: backendUser.bio ?? "",
    isVerified: backendUser.isVerificado ?? false,
    // Perfil de ONG — socialLinks/address no formato do perfil público
    cnpj: backendUser.cnpj ?? null,
    institutionalEmail: backendUser.emailInstitucional ?? null,
    socialLinks: {
      instagram: instagramUrl(backendUser.instagram),
      x: xUrl(backendUser.twitter),
      facebook: backendUser.facebook ?? null,
    },
    address: toFrontendAddress(backendUser),
    // Mesmo formato das linhas do RowsEditor (função vazia vira '', não null)
    team: (backendUser.equipe ?? []).map((member) => ({ name: member.nome, role: member.funcao ?? '' })),
    visitingHours: (backendUser.horariosVisita ?? []).map((slot) => ({ days: slot.dias, hours: slot.horario })),
    cidade: backendUser.cidade ?? '',
    estado: backendUser.estado ?? '',
    cep: backendUser.cep ?? '',           // 🆕
  }
}

function toFrontendUser(backendUser) {
  return {
    ...toFrontendProfile(backendUser),
    // Ainda sem coluna no banco: começam vazios e o AuthContext reaplica o
    // que está salvo localmente (coordenadas e respostas do Perfil AUmatch)
    latitude: backendUser.latitude ?? null,   // 🆕
    longitude: backendUser.longitude ?? null, // 🆕
    moradia: '',
    rotinaExercicio: '',
    tempoForaCasa: '',
    temCriancasOuPets: null,
    speciesPreference: null,
    idealPetProfile: null,
    portePreferido: null,
    // 🆕 Mapeamento de 'telefone' removido — a coluna telefone_whatsapp
    // deixa de existir no banco (ver ALTER TABLE na Parte 2)
  }
}

// Rota única para qualquer tipo de conta — o papel vem em usuario.tipoUsuario
export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, senha: password });

  // Formato confirmado da sua API: { token, tipo, usuario }
  return {
    token: data.token,
    tokenType: data.tipo ?? "Bearer",
    user: toFrontendUser(data.usuario),
  };
}

export async function registerRequest(formData) {
  const endpoint = buildRegisterEndpoint(formData.userType);
  const payload = toRegisterPayload(formData);

  const { data } = await api.post(endpoint, payload);

  const rawUser =
    data?.usuario ??
    data?.user ??
    (data && typeof data === "object" ? data : null);
  return rawUser ? toFrontendUser(rawUser) : null;
}
