import { EVENT_COVER_MAX_LENGTH } from '../../../core/utils/constants'

export const EVENTO_CATEGORIAS = ['FEIRA', 'SAUDE', 'BAZAR', 'WORKSHOP']

export const EVENTO_LIMITS = {
  titulo: { min: 3, max: 120 },
  descricao: 2000,
  localNome: 120,
  logradouro: 150,
  numero: 20,
  complemento: 100,
  bairro: 100,
  cidade: 100,
}

const COVER_URL_FORMAT = /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/

function tooLong(value, max) {
  return value != null && value.length > max
}

// Regras do corpo de POST/PUT /api/eventos (docs/api-campanhas-eventos.md
// §2.2), campo a campo, com as chaves do DTO. O mock devolve a primeira como
// erro 400, igual ao backend; o formulário pode mostrar todas
export function getEventoPayloadErrors(payload, today) {
  const errors = {}
  const { titulo, descricao, data, horaInicio, horaFim, vagas, capaUrl } = payload

  if (!titulo || titulo.length < EVENTO_LIMITS.titulo.min || titulo.length > EVENTO_LIMITS.titulo.max) {
    errors.titulo = `O título deve ter entre ${EVENTO_LIMITS.titulo.min} e ${EVENTO_LIMITS.titulo.max} caracteres.`
  }
  if (!descricao) errors.descricao = 'Descreva o evento.'
  else if (tooLong(descricao, EVENTO_LIMITS.descricao)) {
    errors.descricao = `A descrição pode ter no máximo ${EVENTO_LIMITS.descricao} caracteres.`
  }
  if (!EVENTO_CATEGORIAS.includes(payload.categoria)) errors.categoria = 'Escolha uma categoria.'

  if (!data) errors.data = 'Informe a data do evento.'
  else if (data < today) errors.data = 'A data do evento não pode estar no passado.'
  if (!horaInicio) errors.horaInicio = 'Informe o horário de início.'
  if (horaInicio && horaFim && horaFim <= horaInicio) errors.horaFim = 'O término deve ser depois do início.'

  if (!payload.localNome) errors.localNome = 'Informe o nome do local.'
  else if (tooLong(payload.localNome, EVENTO_LIMITS.localNome)) errors.localNome = 'Nome do local muito longo.'
  if (!payload.logradouro) errors.logradouro = 'Informe o endereço.'
  else if (tooLong(payload.logradouro, EVENTO_LIMITS.logradouro)) errors.logradouro = 'Endereço muito longo.'
  if (!payload.cidade) errors.cidade = 'Informe a cidade.'
  else if (tooLong(payload.cidade, EVENTO_LIMITS.cidade)) errors.cidade = 'Nome da cidade muito longo.'
  if (!/^[A-Z]{2}$/.test(payload.estado ?? '')) errors.estado = 'Selecione o estado.'
  if (payload.cep != null && !/^\d{8}$/.test(payload.cep)) errors.cep = 'O CEP deve ter 8 dígitos.'
  if (tooLong(payload.numero, EVENTO_LIMITS.numero)) errors.numero = 'Número muito longo.'
  if (tooLong(payload.complemento, EVENTO_LIMITS.complemento)) errors.complemento = 'Complemento muito longo.'
  if (tooLong(payload.bairro, EVENTO_LIMITS.bairro)) errors.bairro = 'Nome do bairro muito longo.'

  if (vagas != null && (!Number.isInteger(vagas) || vagas < 1)) {
    errors.vagas = 'As vagas devem ser um número inteiro maior que zero.'
  }
  if (capaUrl != null) {
    if (!COVER_URL_FORMAT.test(capaUrl)) errors.capaUrl = 'Formato de imagem não suportado.'
    else if (capaUrl.length > EVENT_COVER_MAX_LENGTH) errors.capaUrl = 'A imagem da capa é grande demais.'
  }

  return errors
}
