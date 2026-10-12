import { FaUser, FaEnvelope, FaLocationDot, FaHeartCircleCheck } from 'react-icons/fa6'
import { useCepLookup } from '../../../../core/hooks/useCepLookup'
import { BRAZILIAN_STATES } from '../../../../core/utils/brazilianStates'
import AvatarUploadInput from '../../../../core/components/ui/AvatarUploadInput'
import CepField from '../../../../core/components/ui/CepField'
import FormField from '../../../../core/components/ui/FormField'
import { useAccountForm } from '../../hooks/useAccountForm'
import { buildPersonForm, toPersonUpdates } from '../../utils/accountForm'
import ProfileCompletionBar from '../ProfileCompletionBar'
import ProfileSection from '../ProfileSection'
import LifestyleForm from '../LifestyleForm'
import AccountFormShell from './AccountFormShell'
import AccountGroupHeading from './AccountGroupHeading'
import TextAreaField from './TextAreaField'

// Pessoa física (seção 6.1): o perfil público é enxuto — foto, nome, bio e
// cidade. O resto (e-mail, CEP, Perfil AUmatch) é privado
function PersonAccountForm() {
  const { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard } = useAccountForm({
    buildForm: buildPersonForm,
    toUpdates: toPersonUpdates,
  })

  // O CEP (ViaCEP) só preenche cidade e estado, que continuam editáveis à
  // mão. Se a consulta vier sem um dos dois, mantém o que já estava
  const { cep, status: cepStatus, errorMessage: cepError, handleCepChange } = useCepLookup((location) => {
    setFields((prev) => ({
      city: location.city || prev.city,
      state: location.state || prev.state,
    }))
  })

  // CEP pela metade não vai para a API (que só aceita os 8 dígitos) — fica o
  // que já estava salvo
  const handleSave = () => save(cep.length === 8 ? { cep } : {})

  const handleDiscard = () => {
    discard()
    handleCepChange('')
  }

  return (
    <>
      <ProfileCompletionBar checklist={checklist} percentage={percentage} />

      <div className="mt-10">
        <AccountFormShell isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard}>
          <AccountGroupHeading
            visibility="public"
            title="Perfil público"
            description="O que qualquer pessoa vê ao abrir seu perfil, inclusive quem analisa o seu pedido de adoção."
          />

          <ProfileSection icon={FaUser} title="Apresentação" description="Foto, nome e algumas linhas sobre você">
            <div className="mb-6 flex justify-center sm:justify-start">
              <AvatarUploadInput
                value={formData.photoUrl}
                onChange={(dataUrl) => setField('photoUrl', dataUrl)}
                fallbackInitial={formData.name?.charAt(0)?.toUpperCase()}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Nome completo"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Como podemos te chamar?"
                required
              />
              <TextAreaField
                label="Bio"
                value={formData.bio}
                onChange={(value) => setField('bio', value)}
                placeholder="Conte um pouco sobre você: se já tem pets, se cuida ou resgata animais, o que procura numa adoção..."
                hint="Cuida de animais por conta própria? Conte aqui — ajuda quem vai adotar de você a confiar."
              />
            </div>
          </ProfileSection>

          <AccountGroupHeading
            visibility="private"
            title="Dados da conta"
            description="Só você vê. Usados para entrar na plataforma e alimentar as recomendações do AUmatch."
          />

          <ProfileSection icon={FaEnvelope} title="Acesso">
            <FormField
              label="E-mail"
              value={user?.email ?? ''}
              disabled
              hint="Usado para login — não pode ser alterado por aqui."
            />
          </ProfileSection>

          <ProfileSection icon={FaLocationDot} title="Localização" description="Sua cidade e estado aparecem no perfil público">
            <div className="mb-4">
              <CepField cep={cep} status={cepStatus} errorMessage={cepError} onChange={handleCepChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Cidade"
                value={formData.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Preenchido automaticamente pelo CEP"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Estado</label>
                <select
                  value={formData.state}
                  onChange={(e) => setField('state', e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                >
                  <option value="">Selecione</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf.value} value={uf.value}>
                      {uf.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              No perfil público aparecem só a cidade e o estado. O CEP fica com você.
            </p>
          </ProfileSection>

          <ProfileSection
            icon={FaHeartCircleCheck}
            title="Perfil AUmatch"
            description="Isso alimenta o algoritmo que encontra seus matches"
          >
            <LifestyleForm values={formData} onChange={setField} />
          </ProfileSection>
        </AccountFormShell>
      </div>
    </>
  )
}

export default PersonAccountForm
