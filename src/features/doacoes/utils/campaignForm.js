import { todayLocalIso } from '../../../core/utils/localDate'
import { toCampaignPayload } from '../services/doacaoService'
import { getCampaignPayloadErrors } from './campanhaRules'

// Estado do formulário de campanha: mesmo formato do modelo (é o que
// toCampaignPayload espera), mais `hasDeadline`, que só existe na tela
export function buildNewCampaignForm() {
  return {
    title: '',
    description: '',
    category: '',
    isUrgent: false,
    goalAmount: '',
    hasDeadline: false,
    deadline: '',
    coverUrl: null,
  }
}

export function buildCampaignForm(campaign) {
  return {
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    isUrgent: campaign.isUrgent,
    goalAmount: String(campaign.goalAmount),
    hasDeadline: campaign.deadline != null,
    deadline: campaign.deadline ?? '',
    coverUrl: campaign.coverUrl,
  }
}

// O que vai para a API: sem prazo ligado, o deadline não vai
export function formToCampaignValues({ hasDeadline, ...values }) {
  return { ...values, deadline: hasDeadline ? values.deadline : '' }
}

// Ordem visual dos campos: o primeiro com erro recebe o foco
export const CAMPAIGN_FORM_FIELDS = ['title', 'category', 'description', 'goalAmount', 'deadline', 'coverUrl']

export function campaignFieldId(field) {
  return `campaign-field-${field}`
}

// As mesmas regras que o backend aplica (campanhaRules), mais a que só o
// formulário conhece: prazo ligado sem data escolhida
export function getCampaignFormErrors(values) {
  const errors = getCampaignPayloadErrors(toCampaignPayload(formToCampaignValues(values)), todayLocalIso())
  if (values.hasDeadline && !values.deadline) errors.deadline = 'Escolha a data de encerramento.'
  return errors
}
