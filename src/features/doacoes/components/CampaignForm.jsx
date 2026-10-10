import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBullseye, FaHandHoldingHeart, FaImage, FaTriangleExclamation } from 'react-icons/fa6'
import { CAMPAIGN_COVER_MAX_LENGTH } from '../../../core/utils/constants'
import { formatCurrency } from '../../../core/utils/currency'
import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'
import CoverImageInput from '../../../core/components/ui/CoverImageInput'
import FormField from '../../../core/components/ui/FormField'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import ToggleSwitch from '../../../core/components/ui/filters/ToggleSwitch'
import ProfileSection from '../../perfil/components/ProfileSection'
import TextAreaField from '../../perfil/components/account/TextAreaField'
import { CATEGORIA_OPTIONS } from './filters/filterOptions'
import { CAMPAIGN_LIMITS } from '../utils/campanhaRules'
import {
  CAMPAIGN_FORM_FIELDS,
  campaignFieldId,
  formToCampaignValues,
  getCampaignFormErrors,
} from '../utils/campaignForm'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs font-medium text-rose-600">{message}</p>
}

// Criar e editar usam o mesmo formulário. O estado nasce de `initialValues`
// uma vez só — quem usa passa key={id}, então outra campanha recria o form.
// `onSubmit` recebe valores já válidos; a página chama a API e devolve o erro
// dela em `submitError`. `raisedAmount` só existe na edição
function CampaignForm({ initialValues, raisedAmount = 0, submitLabel, isSubmitting, submitError, onSubmit, cancelTo }) {
  const [values, setValues] = useState(() => initialValues)
  const [showErrors, setShowErrors] = useState(false)

  // Os erros só aparecem depois da primeira tentativa de envio; a partir daí
  // somem conforme a pessoa corrige
  const errors = showErrors ? getCampaignFormErrors(values) : {}
  const goalAmount = Number(values.goalAmount)

  const setField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }))

  const handleDeadlineToggle = () => {
    setValues((prev) => ({
      ...prev,
      hasDeadline: !prev.hasDeadline,
      // Sugere 30 dias na primeira vez que liga o prazo
      deadline: prev.hasDeadline ? prev.deadline : prev.deadline || addDaysIso(todayLocalIso(), 30),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const currentErrors = getCampaignFormErrors(values)
    const firstInvalid = CAMPAIGN_FORM_FIELDS.find((field) => currentErrors[field])
    if (firstInvalid) {
      setShowErrors(true)
      requestAnimationFrame(() => {
        const element = document.getElementById(campaignFieldId(firstInvalid))
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus({ preventScroll: true })
      })
      return
    }

    onSubmit(formToCampaignValues(values))
  }

  const fieldProps = (field) => ({ id: campaignFieldId(field), error: errors[field] })

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <ProfileSection icon={FaHandHoldingHeart} title="Sobre a campanha" description="Para que serve o dinheiro arrecadado">
        <div className="flex flex-col gap-5">
          <FormField
            label="Nome da campanha"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Ex: Cirurgia urgente do Rex"
            maxLength={CAMPAIGN_LIMITS.title.max}
            {...fieldProps('title')}
          />

          <div id={campaignFieldId('category')} tabIndex={-1} className="flex flex-col gap-2 outline-none">
            <span className="text-sm font-semibold text-slate-700">Categoria</span>
            <PillToggleGroup options={CATEGORIA_OPTIONS} value={values.category} onChange={(v) => setField('category', v)} />
            <FieldError message={errors.category} />
          </div>

          <TextAreaField
            label="Descrição"
            value={values.description}
            onChange={(value) => setField('description', value)}
            rows={6}
            maxLength={CAMPAIGN_LIMITS.description}
            placeholder="Conte a história, o que o valor vai pagar e como a ONG vai prestar contas."
            {...fieldProps('description')}
          />

          <div className="flex flex-col gap-1 rounded-2xl bg-rose-50/60 p-4">
            <ToggleSwitch
              label="Marcar como urgente"
              checked={values.isUrgent}
              onChange={() => setField('isUrgent', !values.isUrgent)}
            />
            <p className="text-xs text-slate-500">
              Campanhas urgentes ganham o selo vermelho, aparecem primeiro na página inicial e a mais recente vira o
              destaque "SOS" da vitrine.
            </p>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection icon={FaBullseye} title="Meta e prazo" description="Valores em reais, sem centavos">
        <div className="flex flex-col gap-5">
          <FormField
            label="Meta de arrecadação (R$)"
            type="number"
            inputMode="numeric"
            min={CAMPAIGN_LIMITS.goalAmount.min}
            step={1}
            value={values.goalAmount}
            onChange={(e) => setField('goalAmount', e.target.value)}
            placeholder="Ex: 5000"
            hint={
              raisedAmount > 0
                ? `Já foram arrecadados ${formatCurrency(raisedAmount)}${goalAmount > 0 && goalAmount <= raisedAmount ? ': com essa meta, a campanha aparece como "Meta atingida!"' : '.'}`
                : `Entre ${formatCurrency(CAMPAIGN_LIMITS.goalAmount.min)} e ${formatCurrency(CAMPAIGN_LIMITS.goalAmount.max)}. Bater a meta não encerra a campanha.`
            }
            {...fieldProps('goalAmount')}
          />

          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4">
            <ToggleSwitch label="Definir data de encerramento" checked={values.hasDeadline} onChange={handleDeadlineToggle} />
            {values.hasDeadline ? (
              <FormField
                label="Encerra em"
                type="date"
                min={todayLocalIso()}
                value={values.deadline}
                onChange={(e) => setField('deadline', e.target.value)}
                hint="No fim desse dia a campanha encerra sozinha e para de receber doações."
                {...fieldProps('deadline')}
              />
            ) : (
              <p className="text-xs text-slate-500">
                Sem prazo, a campanha fica aberta até a ONG encerrar pelo painel.
              </p>
            )}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection icon={FaImage} title="Capa" description="Opcional">
        <CoverImageInput
          id={campaignFieldId('coverUrl')}
          value={values.coverUrl}
          onChange={(dataUrl) => setField('coverUrl', dataUrl)}
          maxLength={CAMPAIGN_COVER_MAX_LENGTH}
          error={errors.coverUrl}
          emptyHint="Sem capa, a campanha usa um fundo padrão com o ícone da categoria."
        />
      </ProfileSection>

      {submitError && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <FaTriangleExclamation size={15} className="mt-0.5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CampaignForm
