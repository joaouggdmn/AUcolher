import api from './api'

function buildRegisterEndpoint(userType) {
  return userType === 'ONG' ? '/auth/register/ong' : '/auth/register/user'
}

// 🆕 Mesma lógica do cadastro: duas rotas de login, uma por tipo de conta
function buildLoginEndpoint(userType) {
  return userType === 'ONG' ? '/auth/login/ong' : '/auth/login/user'
}

function toRegisterPayload(formData) {
  const basePayload = {
    nome: formData.name,
    email: formData.email,
    senha: formData.password,
  }

  if (formData.userType === 'ONG') {
    return { ...basePayload, cnpj: formData.cnpj }
  }

  return basePayload
}

function toFrontendUser(backendUser) {
  return {
    id: backendUser.id,
    name: backendUser.nome,
    email: backendUser.email,
    userType: backendUser.tipoUsuario,
    photoUrl: backendUser.fotoUrl ?? null,
    telefone: backendUser.telefoneWhatsapp ?? '',
    isVerified: backendUser.isVerificado ?? false,
    cidade: '',
    estado: '',
    moradia: '',
    rotinaExercicio: '',
    tempoSozinho: '',
    temCriancasOuPets: null,
  }
}

export async function loginRequest({ email, password, userType }) {
  const endpoint = buildLoginEndpoint(userType)
  const { data } = await api.post(endpoint, { email, senha: password })

  // Formato confirmado da sua API: { token, tipo, usuario }
  return {
    token: data.token,
    tokenType: data.tipo ?? 'Bearer',
    user: toFrontendUser(data.usuario),
  }
}

export async function registerRequest(formData) {
  const endpoint = buildRegisterEndpoint(formData.userType)
  const payload = toRegisterPayload(formData)

  const { data } = await api.post(endpoint, payload)

  const rawUser = data?.usuario ?? data?.user ?? (data && typeof data === 'object' ? data : null)
  return rawUser ? toFrontendUser(rawUser) : null
}