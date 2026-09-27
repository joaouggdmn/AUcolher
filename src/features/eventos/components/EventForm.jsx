import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarDays, FaClock, FaImage, FaMapLocationDot, FaTriangleExclamation } from 'react-icons/fa6'
import { useCepLookup } from '../../../core/hooks/useCepLookup'
import { BRAZILIAN_STATES } from '../../../core/utils/brazilianStates'
import { EVENT_COVER_MAX_LENGTH } from '../../../core/utils/constants'
import { todayLocalIso } from '../../../core/utils/localDate'
import { maskCEP } from '../../../core/utils/masks'
import CepField from '../../../core/components/ui/CepField'
import CoverImageInput from '../../../core/components/ui/CoverImageInput'
import FormField from '../../../core/components/ui/FormField'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import ToggleSwitch from '../../../core/components/ui/filters/ToggleSwitch'
import ProfileSection from '../../perfil/components/ProfileSection'
import TextAreaField from '../../perfil/components/account/TextAreaField'
import { CATEGORIA_OPTIONS } from './filters/filterOptions'
import { EVENTO_LIMITS } from '../utils/eventoRules'
import { EVENT_FORM_FIELDS, eventFieldId, getEventFormErrors } from '../utils/eventForm'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs font-medium text-rose-600">{message}</p>
}

// Criar e editar usam o mesmo formulário. O estado nasce de `initialValues`
// uma vez só — quem usa passa key={id}, então outro evento recria o form.
// `onSubmit` recebe valores já válidos; a página chama a API e devolve o erro
// dela em `submitError`
function EventForm({ initialValues, minCapacity = 0, submitLabel, isSubmitting, submitError, onSubmit, cancelTo }) {
  const [values, setValues] = useState(() => initialValues)
  const [showErrors, setShowErrors] = useState(false)

  // Os erros só aparecem depois da primeira tentativa de envio; a partir daí
  // somem conforme a pessoa corrige
  const errors = showErrors ? getEventFormErrors(values, { minCapacity }) : {}

  const setField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }))
  const setLocationField = (field, value) =>
    setValues((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }))

  // Preenche rua/bairro/cidade/UF pelo CEP, sem apagar o que a ViaCEP não
  // souber (CEP geral de cidade pequena vem sem rua)
  const cepLookup = useCepLookup((found) => {
    setValues((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        street: found.street || prev.location.street,
        district: found.neighborhood || prev.location.district,
        city: found.city || prev.location.city,
        state: found.state || prev.location.state,
      },
    }))
  })

  const handleCepChange = (rawValue) => {
    setLocationField('cep', maskCEP(rawValue))
    cepLookup.handleCepChange(rawValue)
  }

  const handleLimitToggle = () => {
    setValues((prev) => ({
      ...prev,
      limitCapacity: !prev.limitCapacity,
      capacity: prev.limitCapacity ? '' : prev.capacity || String(Math.max(minCapacity, 1)),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const currentErrors = getEventFormErrors(values, { minCapacity })
    const firstInvalid = EVENT_FORM_FIELDS.find((field) => currentErrors[field])
    if (firstInvalid) {
      setShowErrors(true)
      requestAnimationFrame(() => {
        const element = document.getElementById(eventFieldId(firstInvalid))
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus({ preventScroll: true })
      })
      return
    }

    onSubmit(values)
  }

  const fieldProps = (field) => ({ id: eventFieldId(field), error: errors[field] })

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <ProfileSection icon={FaCalendarDays} title="Sobre o evento" description="O que vai acontecer e para quem é">
        <div className="flex flex-col gap-5">
          <FormField
            label="Nome do evento"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Ex: Feira de Adoção de Primavera"
            maxLength={EVENTO_LIMITS.titulo.max}
            {...fieldProps('title')}
          />

          <div id={eventFieldId('category')} tabIndex={-1} className="flex flex-col gap-2 outline-none">
            <span className="text-sm font-semibold text-slate-700">Categoria</span>
            <PillToggleGroup options={CATEGORIA_OPTIONS} value={values.category} onChange={(v) => setField('category', v)} />
            <FieldError message={errors.category} />
          </div>

          <TextAreaField
            label="Descrição"
            value={values.description}
            onChange={(value) => setField('description', value)}
            rows={6}
            maxLength={EVENTO_LIMITS.descricao}
            placeholder="Conte o que as pessoas vão encontrar, se precisam levar algo e como participar."
            {...fieldProps('description')}
          />
        </div>
      </ProfileSection>

      <ProfileSection icon={FaClock} title="Data e horário" description="O evento acontece em um único dia">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            label="Data"
            type="date"
            min={todayLocalIso()}
            value={values.date}
            onChange={(e) => setField('date', e.target.value)}
            {...fieldProps('date')}
          />
          <FormField
            label="Início"
            type="time"
            value={values.startTime}
            onChange={(e) => setField('startTime', e.target.value)}
            {...fieldProps('startTime')}
          />
          <FormField
            label="Término"
            type="time"
            value={values.endTime}
            onChange={(e) => setField('endTime', e.target.value)}
            hint="Opcional"
            {...fieldProps('endTime')}
          />
        </div>
      </ProfileSection>

      <ProfileSection icon={FaMapLocationDot} title="Local" description="Onde o público deve ir — aparece com link para o mapa">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <FormField
              label="Nome do local"
              value={values.location.venue}
              onChange={(e) => setLocationField('venue', e.target.value)}
              placeholder="Ex: Parque Centenário, Sede da ONG"
              maxLength={EVENTO_LIMITS.localNome}
              {...fieldProps('venue')}
            />
          </div>
          <div id={eventFieldId('cep')} tabIndex={-1} className="col-span-6 flex flex-col gap-1.5 outline-none sm:col-span-3">
            <CepField
              label="CEP (opcional)"
              cep={values.location.cep}
              status={cepLookup.status}
              errorMessage={cepLookup.errorMessage}
              onChange={handleCepChange}
            />
            <FieldError message={errors.cep} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <FormField
              label="Número"
              value={values.location.number}
              onChange={(e) => setLocationField('number', e.target.value)}
              placeholder="Opcional"
              maxLength={EVENTO_LIMITS.numero}
              {...fieldProps('number')}
            />
          </div>
          <div className="col-span-6">
            <FormField
              label="Logradouro"
              value={values.location.street}
              onChange={(e) => setLocationField('street', e.target.value)}
              placeholder="Rua, avenida, praça..."
              maxLength={EVENTO_LIMITS.logradouro}
              {...fieldProps('street')}
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <FormField
              label="Bairro"
              value={values.location.district}
              onChange={(e) => setLocationField('district', e.target.value)}
              placeholder="Opcional"
              maxLength={EVENTO_LIMITS.bairro}
              {...fieldProps('district')}
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <FormField
              label="Complemento"
              value={values.location.complement}
              onChange={(e) => setLocationField('complement', e.target.value)}
              placeholder="Opcional"
              maxLength={EVENTO_LIMITS.complemento}
              {...fieldProps('complement')}
            />
          </div>
          <div className="col-span-4">
            <FormField
              label="Cidade"
              value={values.location.city}
              onChange={(e) => setLocationField('city', e.target.value)}
              maxLength={EVENTO_LIMITS.cidade}
              {...fieldProps('city')}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor={eventFieldId('state')} className="text-sm font-semibold text-slate-700">
              UF
            </label>
            <select
              id={eventFieldId('state')}
              value={values.location.state}
              onChange={(e) => setLocationField('state', e.target.value)}
              aria-invalid={errors.state ? true : undefined}
              className={`min-h-12 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:ring-4 ${
                errors.state
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10'
              }`}
            >
              <option value="">--</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf.value} value={uf.value}>
                  {uf.value}
                </option>
              ))}
            </select>
            <FieldError message={errors.state} />
          </div>
        </div>
      </ProfileSection>

      <ProfileSection icon={FaImage} title="Capa e vagas" description="Os dois são opcionais">
        <div className="flex flex-col gap-6">
          <CoverImageInput
            id={eventFieldId('coverUrl')}
            value={values.coverUrl}
            onChange={(dataUrl) => setField('coverUrl', dataUrl)}
            maxLength={EVENT_COVER_MAX_LENGTH}
            error={errors.coverUrl}
            emptyHint="Sem capa, o evento usa um fundo padrão com o ícone da categoria."
          />

          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4">
            <ToggleSwitch label="Limitar o número de vagas" checked={values.limitCapacity} onChange={handleLimitToggle} />
            {values.limitCapacity && (
              <FormField
                label="Vagas"
                type="number"
                inputMode="numeric"
                min={Math.max(minCapacity, 1)}
                step={1}
                value={values.capacity}
                onChange={(e) => setField('capacity', e.target.value)}
                hint={
                  minCapacity > 0
                    ? `${minCapacity} ${minCapacity === 1 ? 'pessoa já confirmou' : 'pessoas já confirmaram'}: esse é o mínimo.`
                    : 'Quando lotar, o botão de presença mostra "Vagas esgotadas".'
                }
                {...fieldProps('capacity')}
              />
            )}
          </div>
        </div>
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

export default EventForm
