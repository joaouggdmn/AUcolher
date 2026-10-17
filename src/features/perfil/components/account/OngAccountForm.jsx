import {
  FaBuildingNgo,
  FaMapLocationDot,
  FaShareNodes,
  FaPeopleGroup,
  FaEnvelope,
  FaClock,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
} from 'react-icons/fa6'
import { useCepLookup } from '../../../../core/hooks/useCepLookup'
import { BRAZILIAN_STATES } from '../../../../core/utils/brazilianStates'
import { maskCEP, maskCNPJ } from '../../../../core/utils/masks'
import { FACEBOOK_URL_PATTERN, sanitizeInstagramHandle, sanitizeXHandle } from '../../../../core/utils/socialLinks'
import { FOUNDED_YEAR_MIN, getCurrentYear } from '../../../../core/utils/foundedYear'
import { NGO_COVER_MAX_LENGTH } from '../../../../core/utils/constants'
import AvatarUploadInput from '../../../../core/components/ui/AvatarUploadInput'
import CoverImageInput from '../../../../core/components/ui/CoverImageInput'
import CepField from '../../../../core/components/ui/CepField'
import CitySelect from '../../../../core/components/ui/CitySelect'
import FormField from '../../../../core/components/ui/FormField'
import AuthInput from '../../../auth/components/AuthInput'
import { useAccountForm } from '../../hooks/useAccountForm'
import { FOUNDED_YEAR_FIELD_ID, buildOngForm, toOngUpdates } from '../../utils/accountForm'
import ProfileCompletionBar from '../ProfileCompletionBar'
import ProfileSection from '../ProfileSection'
import AccessSection from './AccessSection'
import DeleteAccountSection from './DeleteAccountSection'
import ModerationEmailSection from './ModerationEmailSection'
import AccountFormShell from './AccountFormShell'
import AccountGroupHeading from './AccountGroupHeading'
import TextAreaField from './TextAreaField'
import RowsEditor from './RowsEditor'
import VisitingHoursEditor from './VisitingHoursEditor'

// Coluna NOT NULL em ong_equipe (nome)
const TEAM_FIELDS = [
  { key: 'name', label: 'Nome', placeholder: 'Ex: Marina Costa', required: true },
  { key: 'role', label: 'Função', placeholder: 'Ex: Coordenadora de adoções' },
]

// ONG (seção 6.2): o perfil público é institucional — logo, apresentação,
// endereço e horários de visita, contatos, redes e equipe. Não passa pelo
// Perfil AUmatch, que descreve a rotina de uma pessoa adotante
// `account` + `onSave`: o admin editando a ONG pela moderação (ver useAccountForm)
function OngAccountForm({ account = null, onSave = null }) {
  const isModeration = account != null
  const { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard } = useAccountForm({
    buildForm: buildOngForm,
    toUpdates: toOngUpdates,
    account,
    onSave,
  })

  const setAddressField = (field, value) => setFields((prev) => ({ address: { ...prev.address, [field]: value } }))

  // Preenche logradouro/bairro/cidade/UF pelo CEP, sem apagar o que a
  // ViaCEP não souber (CEP geral de cidade pequena vem sem rua)
  const cepLookup = useCepLookup((found) => {
    setFields((prev) => ({
      address: {
        ...prev.address,
        street: found.street || prev.address.street,
        district: found.neighborhood || prev.address.district,
        city: found.city || prev.address.city,
        state: found.state || prev.address.state,
      },
    }))
  })

  const handleCepChange = (rawValue) => {
    setAddressField('cep', maskCEP(rawValue))
    cepLookup.handleCepChange(rawValue)
  }

  const handleSave = () => save()

  return (
    <>
      {!isModeration && (
        <ProfileCompletionBar
          checklist={checklist}
          percentage={percentage}
          description="Um perfil institucional completo passa confiança para quem quer adotar, visitar ou doar."
        />
      )}

      <div className="mt-10">
        <AccountFormShell isDirty={isDirty} onSave={handleSave} onDiscard={discard}>
          <AccountGroupHeading visibility="public" title="Perfil público da instituição" />

          <ProfileSection icon={FaBuildingNgo} title="Identidade">
            <div className="mb-6 flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-slate-700">Banner</p>
              <CoverImageInput
                id="account-cover"
                value={formData.coverUrl}
                onChange={(dataUrl) => setField('coverUrl', dataUrl)}
                maxLength={NGO_COVER_MAX_LENGTH}
                maxSize={1400}
                label="Escolher banner"
                emptyHint="Opcional. Aparece no topo do perfil público e no card da ONG na página inicial. Prefira uma imagem horizontal."
              />
            </div>

            <div className="mb-6 flex justify-center sm:justify-start">
              <AvatarUploadInput
                value={formData.photoUrl}
                onChange={(dataUrl) => setField('photoUrl', dataUrl)}
                fallbackInitial={formData.name?.charAt(0)?.toUpperCase()}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Nome da instituição"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ex: Abrigo Amigo Fiel"
                required
                className="sm:col-span-2"
              />
              <FormField
                label="CNPJ"
                value={user?.cnpj ? maskCNPJ(user.cnpj) : ''}
                disabled
                hint="Aparece no perfil. Vinculado ao cadastro, não pode ser alterado por aqui."
              />
              {/* id: alvo do atalho "Adicionar ano de fundação" do topo da página */}
              <FormField
                id={FOUNDED_YEAR_FIELD_ID}
                label="Ano de fundação"
                type="number"
                inputMode="numeric"
                min={FOUNDED_YEAR_MIN}
                max={getCurrentYear()}
                step={1}
                value={formData.foundedYear}
                onChange={(e) => setField('foundedYear', e.target.value)}
                placeholder="Ex: 2016"
                hint={
                  formData.foundedYear
                    ? `Aparece no perfil público como "Fundada em ${formData.foundedYear}".`
                    : 'Opcional. Enquanto estiver vazio, não aparece no perfil público.'
                }
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Sobre a instituição"
                  value={formData.bio}
                  onChange={(value) => setField('bio', value)}
                  rows={5}
                  placeholder="A missão da ONG, quais animais vocês acolhem e como as pessoas podem ajudar."
                />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection icon={FaMapLocationDot} title="Endereço e visitas">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-3">
                <CepField
                  cep={formData.address.cep}
                  status={cepLookup.status}
                  errorMessage={cepLookup.errorMessage}
                  onChange={handleCepChange}
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  label="Número"
                  value={formData.address.number}
                  onChange={(e) => setAddressField('number', e.target.value)}
                  placeholder="Ex: 120 ou S/N"
                  required
                />
              </div>
              <div className="col-span-6">
                <FormField
                  label="Logradouro"
                  value={formData.address.street}
                  onChange={(e) => setAddressField('street', e.target.value)}
                  placeholder="Rua, avenida..."
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  label="Bairro"
                  value={formData.address.district}
                  onChange={(e) => setAddressField('district', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <FormField
                  label="Complemento"
                  value={formData.address.complement}
                  onChange={(e) => setAddressField('complement', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="col-span-4">
                {/* Lista do IBGE: a cidade sai sempre com a grafia oficial */}
                <CitySelect
                  id="ong-address-city"
                  state={formData.address.state}
                  city={formData.address.city}
                  onChange={(city) => setAddressField('city', city)}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">UF</label>
                <select
                  value={formData.address.state}
                  onChange={(e) => setFields((prev) => ({ address: { ...prev.address, state: e.target.value, city: '' } }))}
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

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                <FaClock size={13} className="text-emerald-600" />
                Horário de visitas
              </p>
              <VisitingHoursEditor
                value={formData.visitingHours}
                onChange={(value) => setField('visitingHours', value)}
              />
            </div>
          </ProfileSection>

          <ProfileSection icon={FaShareNodes} title="Contato e redes sociais">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p className="flex items-start gap-2 rounded-xl bg-emerald-50/60 px-3.5 py-2.5 text-xs text-emerald-900 sm:col-span-2">
                <FaEnvelope size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>
                  O e-mail da conta, <strong className="break-all">{user?.email}</strong>, aparece no perfil público como
                  contato da instituição.
                </span>
              </p>
              <AuthInput
                id="instagram"
                label="Instagram"
                icon={FaInstagram}
                prefix="@"
                placeholder="suaong"
                value={formData.instagram}
                onChange={(e) => setField('instagram', sanitizeInstagramHandle(e.target.value))}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <AuthInput
                id="twitter"
                label="X (Twitter)"
                icon={FaXTwitter}
                prefix="@"
                placeholder="suaong"
                value={formData.twitter}
                onChange={(e) => setField('twitter', sanitizeXHandle(e.target.value))}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <div className="sm:col-span-2">
                <AuthInput
                  id="facebook"
                  label="Facebook"
                  icon={FaFacebookF}
                  placeholder="facebook.com/suaong"
                  value={formData.facebook}
                  onChange={(e) => setField('facebook', e.target.value)}
                  inputMode="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  pattern={FACEBOOK_URL_PATTERN}
                  title="Cole o link da página no Facebook, ex: facebook.com/suaong"
                />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection icon={FaPeopleGroup} title="Equipe">
            <RowsEditor
              rows={formData.team}
              onChange={(rows) => setField('team', rows)}
              fields={TEAM_FIELDS}
              addLabel="Adicionar integrante"
              emptyText="Nenhum integrante cadastrado. Mostrar quem está por trás da ONG aumenta a confiança de quem adota."
              maxRows={20}
            />
          </ProfileSection>

          <AccountGroupHeading visibility="private" title="Dados da conta" />

          {isModeration ? (
            <ModerationEmailSection
              value={formData.email}
              onChange={(value) => setField('email', value)}
              isGoogleAccount={user.provider === 'GOOGLE'}
              isOng
            />
          ) : (
            <AccessSection emailHint="Aparece no perfil público como contato. Não pode ser alterado por aqui." />
          )}

          {!isModeration && <DeleteAccountSection />}
        </AccountFormShell>
      </div>
    </>
  )
}

export default OngAccountForm
