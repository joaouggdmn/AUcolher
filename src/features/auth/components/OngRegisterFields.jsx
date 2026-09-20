import { useId } from 'react'
import {
  FaIdCard,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaCircleCheck,
  FaCircleInfo,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import AuthInput from './AuthInput'
import { useCnpjLookup } from '../hooks/useCnpjLookup'
import { maskCEP, maskCNPJ } from '../../../core/utils/masks'
import { BRAZILIAN_STATES } from '../../../core/utils/brazilianStates'
import { FACEBOOK_URL_PATTERN, sanitizeInstagramHandle, sanitizeXHandle } from '../../../core/utils/socialLinks'

const BIO_MAX_LENGTH = 500

const CNPJ_STATUS_ICONS = {
  loading: <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />,
  success: <FaCircleCheck size={16} className="text-emerald-600" />,
  error: <FaTriangleExclamation size={15} className="text-rose-500" />,
}

const CNPJ_HINTS = {
  idle: 'Ao sair do campo, buscamos razão social e endereço na Receita Federal.',
  loading: 'Consultando a Receita Federal...',
  success: (
    <span className="font-medium text-emerald-600">Dados preenchidos automaticamente. Revise antes de continuar.</span>
  ),
}

function FormSection({ title, badge, children }) {
  const titleId = useId()

  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 id={titleId} className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{badge}</span>
        )}
        <span className="h-px flex-1 bg-slate-100" />
      </div>
      {children}
    </div>
  )
}

// values: formData do RegisterPage; onFieldsChange(patch) mescla um ou mais campos
function OngRegisterFields({ values, onFieldsChange }) {
  const { status, errorMessage, company, lookup, reset } = useCnpjLookup(({ legalName, address }) => {
    onFieldsChange({
      ...(legalName && { name: legalName }),
      cep: maskCEP(address.cep),
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      uf: address.state,
    })
  })

  const handleChange = (e) => onFieldsChange({ [e.target.name]: e.target.value })

  const handleCnpjChange = (e) => {
    onFieldsChange({ cnpj: maskCNPJ(e.target.value) })
    if (status !== 'idle') reset()
  }

  const isInactiveCompany = status === 'success' && company && !company.isActive

  return (
    <div className="flex flex-col gap-8">
      <FormSection title="Instituição">
        <AuthInput
          id="cnpj"
          name="cnpj"
          label="CNPJ"
          icon={FaIdCard}
          placeholder="00.000.000/0000-00"
          value={values.cnpj}
          onChange={handleCnpjChange}
          onBlur={(e) => lookup(e.target.value)}
          inputMode="numeric"
          maxLength={18}
          autoComplete="off"
          trailing={CNPJ_STATUS_ICONS[status]}
          error={status === 'error' ? errorMessage : null}
          hint={CNPJ_HINTS[status]}
          required
        />

        {isInactiveCompany && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
            <FaTriangleExclamation size={12} className="mt-0.5 shrink-0" />
            A Receita Federal informa a situação deste CNPJ como &quot;{company.situation.toLowerCase()}&quot;.
            Confira se o número está correto antes de continuar.
          </p>
        )}

        <AuthInput
          id="name"
          name="name"
          label="Nome da instituição"
          icon={FaBuilding}
          placeholder="Ex: Abrigo Amigo Fiel"
          value={values.name}
          onChange={handleChange}
          hint="Preenchido com a razão social do CNPJ. Você pode ajustar se preferir."
          required
        />
      </FormSection>

      <FormSection title="Endereço">
        {/* Campos curtos (CEP/Número, Cidade/UF) ficam pareados até no celular */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3">
            <AuthInput
              id="cep"
              name="cep"
              label="CEP"
              placeholder="00000-000"
              value={values.cep}
              onChange={(e) => onFieldsChange({ cep: maskCEP(e.target.value) })}
              inputMode="numeric"
              maxLength={9}
              autoComplete="postal-code"
              required
            />
          </div>
          <div className="col-span-3">
            <AuthInput
              id="number"
              name="number"
              label="Número"
              placeholder="Ex: 120 ou S/N"
              value={values.number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-6">
            <AuthInput
              id="street"
              name="street"
              label="Logradouro"
              placeholder="Rua, avenida..."
              value={values.street}
              onChange={handleChange}
              autoComplete="address-line1"
              required
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <AuthInput
              id="district"
              name="district"
              label="Bairro"
              value={values.district}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <AuthInput
              id="complement"
              name="complement"
              label="Complemento"
              placeholder="Opcional"
              value={values.complement}
              onChange={handleChange}
              autoComplete="address-line2"
            />
          </div>
          <div className="col-span-4">
            <AuthInput
              id="city"
              name="city"
              label="Cidade"
              value={values.city}
              onChange={handleChange}
              autoComplete="address-level2"
              required
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="uf" className="text-sm font-semibold text-slate-700">
              UF
            </label>
            <select
              id="uf"
              name="uf"
              value={values.uf}
              onChange={handleChange}
              required
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            >
              <option value="">--</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf.value} value={uf.value} title={uf.label}>
                  {uf.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Acesso">
        <AuthInput
          id="email"
          name="email"
          label="E-mail"
          type="email"
          icon={FaEnvelope}
          placeholder="contato@suaong.org"
          value={values.email}
          onChange={handleChange}
          autoComplete="email"
          hint="Pode ser de qualquer provedor: Gmail, Hotmail, Outlook ou domínio próprio."
          required
        />
        <AuthInput
          id="password"
          name="password"
          label="Senha"
          type="password"
          icon={FaLock}
          placeholder="Mínimo 6 caracteres"
          value={values.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </FormSection>

      <FormSection title="Redes sociais e bio" badge="Opcional">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            id="instagram"
            name="instagram"
            label="Instagram"
            icon={FaInstagram}
            prefix="@"
            placeholder="suaong"
            value={values.instagram}
            onChange={(e) => onFieldsChange({ instagram: sanitizeInstagramHandle(e.target.value) })}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <AuthInput
            id="twitter"
            name="twitter"
            label="X (Twitter)"
            icon={FaXTwitter}
            prefix="@"
            placeholder="suaong"
            value={values.twitter}
            onChange={(e) => onFieldsChange({ twitter: sanitizeXHandle(e.target.value) })}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <div className="sm:col-span-2">
            <AuthInput
              id="facebook"
              name="facebook"
              label="Facebook"
              icon={FaFacebookF}
              placeholder="facebook.com/suaong"
              value={values.facebook}
              onChange={handleChange}
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              pattern={FACEBOOK_URL_PATTERN}
              title="Cole o link da página no Facebook, ex: facebook.com/suaong"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-semibold text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={BIO_MAX_LENGTH}
            value={values.bio}
            onChange={handleChange}
            placeholder="Conte em poucas linhas a missão da sua ONG, quais animais vocês acolhem e como as pessoas podem ajudar."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
          <p className="self-end text-xs text-slate-400">
            {values.bio.length}/{BIO_MAX_LENGTH}
          </p>
        </div>

        <p className="flex items-start gap-2 text-xs text-slate-400">
          <FaCircleInfo size={12} className="mt-0.5 shrink-0" />
          Você pode pular estes campos agora e preenchê-los mais tarde no seu perfil.
        </p>
      </FormSection>
    </div>
  )
}

export default OngRegisterFields
