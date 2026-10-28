import {
  CAMPAIGN_COVER_MAX_LENGTH,
  DONATION_MAX_AMOUNT,
  DONATION_MIN_AMOUNT,
} from '../../../core/utils/constants'

export const CAMPAIGN_CATEGORIES = ['HEALTH', 'FOOD', 'INFRASTRUCTURE', 'NEUTERING', 'RESCUE', 'OTHER']

export const CAMPAIGN_LIMITS = {
  title: { min: 3, max: 120 },
  description: 2000,
  customCategory: 30,
  goalAmount: { min: 50, max: 1_000_000 },
}

const COVER_URL_FORMAT = /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/

// Regras do corpo de POST/PUT /api/campaigns (docs/entrega-final/api-campanhas-doacoes.md),
// campo a campo, com as chaves do DTO. O backend devolve a primeira como
// erro 400; o formulário pode mostrar todas
export function getCampaignPayloadErrors(payload, today) {
  const errors = {}
  const { title, description, category, customCategory, goalAmount, deadline, coverUrl } = payload
  const { min, max } = CAMPAIGN_LIMITS.goalAmount

  if (!title || title.length < CAMPAIGN_LIMITS.title.min || title.length > CAMPAIGN_LIMITS.title.max) {
    errors.title = `O título deve ter entre ${CAMPAIGN_LIMITS.title.min} e ${CAMPAIGN_LIMITS.title.max} caracteres.`
  }
  if (!description) errors.description = 'Descreva a campanha.'
  else if (description.length > CAMPAIGN_LIMITS.description) {
    errors.description = `A descrição pode ter no máximo ${CAMPAIGN_LIMITS.description} caracteres.`
  }
  if (!CAMPAIGN_CATEGORIES.includes(category)) errors.category = 'Escolha uma categoria.'
  else if (category === 'OTHER') {
    if (!customCategory) errors.customCategory = 'Dê um nome para a categoria.'
    else if (customCategory.length > CAMPAIGN_LIMITS.customCategory) {
      errors.customCategory = `O nome da categoria pode ter no máximo ${CAMPAIGN_LIMITS.customCategory} caracteres.`
    }
  }

  if (!Number.isInteger(goalAmount) || goalAmount < min || goalAmount > max) {
    errors.goalAmount = `A meta deve ser um valor inteiro entre R$ ${min} e R$ ${max.toLocaleString('pt-BR')}.`
  }
  if (deadline != null && deadline < today) errors.deadline = 'O prazo não pode estar no passado.'

  if (coverUrl != null) {
    if (!COVER_URL_FORMAT.test(coverUrl)) errors.coverUrl = 'Formato de imagem não suportado.'
    else if (coverUrl.length > CAMPAIGN_COVER_MAX_LENGTH) errors.coverUrl = 'A imagem da capa é grande demais.'
  }

  return errors
}

// Cada ONG tem no máximo uma campanha urgente ativa: senão toda campanha
// vira urgente e o selo perde o sentido. Devolve a outra urgente, se houver
export function findOtherUrgentCampaign(campaigns, currentId = null) {
  return (
    campaigns.find(
      (campaign) => campaign.isUrgent && !campaign.isClosed && String(campaign.id) !== String(currentId)
    ) ?? null
  )
}

// Valor da doação: reais inteiros entre o mínimo e o máximo. null = válido
export function getDonationAmountError(amount) {
  if (!Number.isInteger(amount)) return 'Informe um valor em reais, sem centavos.'
  if (amount < DONATION_MIN_AMOUNT) return `A doação mínima é de R$ ${DONATION_MIN_AMOUNT}.`
  if (amount > DONATION_MAX_AMOUNT) {
    return `A doação máxima por PIX é de R$ ${DONATION_MAX_AMOUNT.toLocaleString('pt-BR')}.`
  }
  return null
}
