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
import AvatarUploadInput from '../../../../core/components/ui/AvatarUploadInput'
import CepField from '../../../../core/components/ui/CepField'
import FormField from '../../../../core/components/ui/FormField'
import AuthInput from '../../../auth/components/AuthInput'
import { useAccountForm } from '../../hooks/useAccountForm'
import { FOUNDED_YEAR_FIELD_ID, buildOngForm, toOngUpdates } from '../../utils/accountForm'
import ProfileCompletionBar from '../ProfileCompletionBar'
import ProfileSection from '../ProfileSection'
import AccountFormShell from './AccountFormShell'
import AccountGroupHeading from './AccountGroupHeading'
import TextAreaField from './TextAreaField'
import RowsEditor from './RowsEditor'

// Colunas NOT NULL em ong_horarios_visita (dias, horario) e ong_equipe (nome)
const VISITING_HOURS_FIELDS = [
  { key: 'days', label: 'Dias', placeholder: 'Ex: Terça a sexta', required: true },
  { key: 'hours', label: 'Horário', placeholder: 'Ex: 14h às 18h', required: true },
]

const TEAM_FIELDS = [
  { key: 'name', label: 'Nome', placeholder: 'Ex: Marina Costa', required: true },
  { key: 'role', label: 'Função', placeholder: 'Ex: Coordenadora de adoções' },
]

// ONG (seção 6.2): o perfil público é institucional — logo, apresentação,
// endereço e horários de visita, contatos, redes e equipe. Não passa pelo
// Perfil AUmatch, que descreve a rotina de uma pessoa adotante
function OngAccountForm() {
  const { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard } = useAccountForm({
    buildForm: buildOngForm,
    toUpdates: toOngUpdates,
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
      <ProfileCompletionBar
        checklist={checklist}
        percentage={percentage}
        description="Um perfil institucional completo passa confiança para quem quer adotar, visitar ou doar."
      />

      <div className="mt-10">
        <AccountFormShell isDirty={isDirty} onSave={handleSave} onDiscard={discard}>
          <AccountGroupHeading
            visibility="public"
            title="Perfil público da instituição"
            description="Tudo aqui aparece na página da ONG. É o que adotantes e doadores usam para conhecer e confiar em vocês."
          />

          <ProfileSection icon={FaBuildingNgo} title="Identidade" description="Logo, nome e apresentação da instituição">
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

          <ProfileSection icon={FaMapLocationDot} title="Endereço e visitas" description="Onde e quando a instituição recebe visitas">
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
                <FormField
                  label="Cidade"
                  value={formData.address.city}
                  onChange={(e) => setAddressField('city', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">UF</label>
                <select
                  value={formData.address.state}
                  onChange={(e) => setAddressField('state', e.target.value)}
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
              <RowsEditor
                rows={formData.visitingHours}
                onChange={(rows) => setField('visitingHours', rows)}
                fields={VISITING_HOURS_FIELDS}
                addLabel="Adicionar horário"
                emptyText="Nenhum horário cadastrado. Se as visitas forem só com agendamento, diga isso aqui."
              />
            </div>
          </ProfileSection>

          <ProfileSection icon={FaShareNodes} title="Contato e redes sociais" description="Canais públicos para falar com a instituição">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AuthInput
                  id="institutionalEmail"
                  label="E-mail institucional"
                  type="email"
                  icon={FaEnvelope}
                  placeholder="contato@suaong.org"
                  value={formData.institutionalEmail}
                  onChange={(e) => setField('institutionalEmail', e.target.value)}
                  hint="Opcional. Pode ser diferente do e-mail de login, que continua privado."
                />
              </div>
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

          <ProfileSection icon={FaPeopleGroup} title="Equipe" description="Quem faz a instituição acontecer">
            <RowsEditor
              rows={formData.team}
              onChange={(rows) => setField('team', rows)}
              fields={TEAM_FIELDS}
              addLabel="Adicionar integrante"
              emptyText="Nenhum integrante cadastrado. Mostrar quem está por trás da ONG aumenta a confiança de quem adota."
              maxRows={20}
            />
          </ProfileSection>

          <AccountGroupHeading
            visibility="private"
            title="Dados da conta"
            description="Só a instituição vê. Usados para entrar na plataforma."
          />

          <ProfileSection icon={FaEnvelope} title="Acesso">
            <FormField
              label="E-mail de login"
              value={user?.email ?? ''}
              disabled
              hint="Não aparece no perfil público e não pode ser alterado por aqui."
            />
          </ProfileSection>
        </AccountFormShell>
      </div>
    </>
  )
}

export default OngAccountForm
