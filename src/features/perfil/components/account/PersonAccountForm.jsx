import { FaUser, FaEnvelope, FaLocationDot, FaLocationCrosshairs, FaHeartCircleCheck } from 'react-icons/fa6'
import { useLocationCapture } from '../../../../core/hooks/useLocationCapture'
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
// cidade. O resto (e-mail, localização exata, Perfil AUmatch) é privado
function PersonAccountForm() {
  const { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard } = useAccountForm({
    buildForm: buildPersonForm,
    toUpdates: toPersonUpdates,
  })

  // Callback único que recebe o resultado, não importa se veio do CEP
  // (ViaCEP + Nominatim) ou do GPS (navegador + Nominatim reverse).
  // Preserva coordenadas já existentes se a nova resolução vier vazia
  // (ex: forwardGeocode falhou, mas já tínhamos um lat/lng bom do GPS).
  const handleLocationResolved = (location) => {
    setFields((prev) => ({
      cidade: location.city || prev.cidade,
      estado: location.state || prev.estado,
      latitude: location.latitude ?? prev.latitude,
      longitude: location.longitude ?? prev.longitude,
    }))
  }

  const { cep, cepStatus, cepError, handleCepChange, requestGpsLocation, isLocatingGps, gpsError } =
    useLocationCapture(handleLocationResolved)

  // Edição manual de cidade/estado invalida as coordenadas: se o usuário
  // corrige o texto à mão, não podemos mais garantir que lat/lng batem
  // com o endereço exibido — melhor não salvar uma coordenada errada do
  // que manter uma desatualizada silenciosamente
  const handleManualLocationChange = (field, value) => {
    setFields({ [field]: value, latitude: null, longitude: null })
  }

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
            description="Só você vê. Usados para entrar na plataforma, calcular distâncias e alimentar as recomendações do AUmatch."
          />

          <ProfileSection icon={FaEnvelope} title="Acesso">
            <FormField
              label="E-mail"
              value={user?.email ?? ''}
              disabled
              hint="Usado para login — não pode ser alterado por aqui."
            />
          </ProfileSection>

          <ProfileSection icon={FaLocationDot} title="Localização" description="Essencial para encontrar pets perto de você">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <CepField cep={cep} status={cepStatus} errorMessage={cepError} onChange={handleCepChange} />
              </div>

              <div className="flex flex-col items-start gap-1 sm:items-end">
                <button
                  type="button"
                  onClick={requestGpsLocation}
                  disabled={isLocatingGps}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
                >
                  {isLocatingGps ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
                  ) : (
                    <FaLocationCrosshairs size={14} />
                  )}
                  Usar localização exata
                </button>
                {gpsError && <p className="max-w-[220px] text-right text-[11px] font-medium text-rose-600">{gpsError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Cidade"
                value={formData.cidade}
                onChange={(e) => handleManualLocationChange('cidade', e.target.value)}
                placeholder="Preenchido automaticamente pelo CEP ou GPS"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleManualLocationChange('estado', e.target.value)}
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

            {/* Latitude/longitude nunca aparecem como inputs — só um
                indicador discreto de que a coordenada exata existe */}
            <div className="mt-3 flex flex-col gap-1">
              {formData.latitude !== null && formData.longitude !== null ? (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <FaLocationCrosshairs size={11} />
                  Localização exata capturada
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Ainda sem coordenadas exatas — use o CEP ou o botão de GPS acima para uma localização mais precisa.
                </p>
              )}
              <p className="text-xs text-slate-400">
                No perfil público aparecem só a cidade e o estado. CEP e coordenadas ficam com você.
              </p>
            </div>
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
