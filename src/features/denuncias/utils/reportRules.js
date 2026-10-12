// Regras das denúncias (regras-de-negocios.md §8), iguais no modal e no
// servidor falso (denunciasMock), como o backend fará no POST /api/reports

// O que pode ser denunciado: o anúncio de um animal ou o perfil de uma conta
export const REPORT_TARGET_TYPES = ['ANIMAL', 'USER']

export const REPORT_DESCRIPTION_MAX_LENGTH = 500

// Categorias fixas. `targets` diz em que tipo de alvo cada uma faz sentido
// ("perfil falso" não existe num anúncio). A ordem é a da lista no modal
export const REPORT_REASONS = [
  {
    value: 'FAKE_PROFILE',
    label: 'Perfil falso',
    hint: 'Se passa por outra pessoa ou ONG, ou usa dados inventados.',
    targets: ['USER'],
  },
  {
    value: 'SCAM',
    label: 'Golpe ou fraude',
    hint: 'Pede dinheiro, cobra pela adoção ou tenta enganar quem adota.',
    targets: ['ANIMAL', 'USER'],
  },
  {
    value: 'ANIMAL_ABUSE',
    label: 'Maus-tratos',
    hint: 'Sinais de que o animal sofre ou sofreu maus-tratos.',
    targets: ['ANIMAL', 'USER'],
  },
  {
    value: 'IMPROPER_CONTENT',
    label: 'Conteúdo impróprio',
    hint: 'Fotos ou textos ofensivos, violentos ou sem relação com adoção.',
    targets: ['ANIMAL', 'USER'],
  },
  {
    value: 'SPAM',
    label: 'Spam',
    hint: 'Conteúdo repetido ou propaganda de produtos e serviços.',
    targets: ['ANIMAL', 'USER'],
  },
  {
    value: 'OTHER',
    label: 'Outro motivo',
    hint: 'Conte o que aconteceu na descrição.',
    targets: ['ANIMAL', 'USER'],
  },
]

const REASON_BY_VALUE = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.value, reason]))

// Identifica o alvo de uma denúncia (agrupar, achar a que já está em
// análise). O perfil leva também o nome: no modo mock, os ids 1 a 7 dos perfis
// fictícios se repetem com os do banco real (plano-painel-admin.md §6), e
// mesmo id com outro nome é outra conta
export function reportTargetKey({ targetType, targetId, target }) {
  const name = targetType === 'USER' ? (target?.name ?? '') : ''
  return `${targetType}:${targetId}:${name}`
}

export function reasonsFor(targetType) {
  return REPORT_REASONS.filter((reason) => reason.targets.includes(targetType))
}

export function getReasonLabel(value) {
  return REASON_BY_VALUE[value]?.label ?? 'Outro motivo'
}

// Corpo do POST /api/reports, campo a campo. O mock devolve a primeira como
// erro 400, igual ao backend; o modal mostra cada uma no seu campo
export function getReportPayloadErrors({ targetType, reason, description }) {
  const errors = {}
  const text = description?.trim() ?? ''

  if (!REPORT_TARGET_TYPES.includes(targetType)) errors.targetType = 'Não é possível denunciar este conteúdo.'
  if (!REASON_BY_VALUE[reason]?.targets.includes(targetType)) errors.reason = 'Escolha o motivo da denúncia.'
  if (reason === 'OTHER' && !text) errors.description = 'Conte o que aconteceu: a descrição é obrigatória em "Outro motivo".'
  else if (text.length > REPORT_DESCRIPTION_MAX_LENGTH) {
    errors.description = `A descrição pode ter no máximo ${REPORT_DESCRIPTION_MAX_LENGTH} caracteres.`
  }
  return errors
}
