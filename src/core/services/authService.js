import api from "./api";

function buildRegisterEndpoint(userType) {
  return userType === "ONG" ? "/auth/register/ong" : "/auth/register/user";
}

// 🆕 Mesma lógica do cadastro: duas rotas de login, uma por tipo de conta
function buildLoginEndpoint(userType) {
  return userType === "ONG" ? "/auth/login/ong" : "/auth/login/user";
}

function toRegisterPayload(formData) {
  const basePayload = {
    nome: formData.name,
    email: formData.email,
    senha: formData.password,
  };

  if (formData.userType === "ONG") {
    return { ...basePayload, cnpj: formData.cnpj };
  }

  return basePayload;
}

function toFrontendUser(backendUser) {
  return {
    id: backendUser.id,
    name: backendUser.nome,
    email: backendUser.email,
    userType: backendUser.tipoUsuario,
    photoUrl: backendUser.fotoUrl ?? null,
    isVerified: backendUser.isVerificado ?? false,
    cidade: backendUser.cidade ?? '',
    estado: backendUser.estado ?? '',
    cep: backendUser.cep ?? '',           // 🆕
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

export async function loginRequest({ email, password, userType }) {
  const endpoint = buildLoginEndpoint(userType);
  const { data } = await api.post(endpoint, { email, senha: password });

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
