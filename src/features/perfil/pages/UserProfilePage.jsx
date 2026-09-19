import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUser, FaLocationDot, FaLocationCrosshairs, FaHeartCircleCheck, FaFloppyDisk, FaPaw, FaStar, FaHandHoldingHeart, FaEye } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { useLocationCapture } from '../../../core/hooks/useLocationCapture'
import { BRAZILIAN_STATES } from '../../../core/utils/brazilianStates'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import AvatarUploadInput from '../../../core/components/ui/AvatarUploadInput'
import CepField from '../../../core/components/ui/CepField'
import FormField from '../../../core/components/ui/FormField'
import ProfileCompletionBar from '../components/ProfileCompletionBar'
import ProfileSection from '../components/ProfileSection'
import LifestyleForm from '../components/LifestyleForm'
import ProfileTabs from '../components/ProfileTabs'
import UserAnimalsTab from '../components/tabs/UserAnimalsTab'
import ReviewsTab from '../components/tabs/ReviewsTab'
import ImpactTab from '../components/tabs/ImpactTab'

function UserProfilePage() {
  const { user, updateProfile } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    photoUrl: user?.photoUrl ?? null,
    cidade: user?.cidade ?? '',
    estado: user?.estado ?? '',
    latitude: user?.latitude ?? null,   // 🆕 oculto — nunca vira input visível
    longitude: user?.longitude ?? null, // 🆕
    moradia: user?.moradia ?? '',
    rotinaExercicio: user?.rotinaExercicio ?? '',
    tempoForaCasa: user?.tempoForaCasa ?? '',
    temCriancasOuPets: user?.temCriancasOuPets ?? null,
    speciesPreference: user?.speciesPreference ?? null,
    idealPetProfile: user?.idealPetProfile ?? null,
    portePreferido: user?.portePreferido ?? null,
    // pelagemPreferida removido
  })
  const [successMessage, setSuccessMessage] = useState(null)

  const { checklist, percentage } = useProfileCompletion(formData)

  // Callback único que recebe o resultado, não importa se veio do CEP
  // (ViaCEP + Nominatim) ou do GPS (navegador + Nominatim reverse).
  // Preserva coordenadas já existentes se a nova resolução vier vazia
  // (ex: forwardGeocode falhou, mas já tínhamos um lat/lng bom do GPS).
  const handleLocationResolved = (location) => {
    setFormData((prev) => ({
      ...prev,
      cidade: location.city || prev.cidade,
      estado: location.state || prev.estado,
      latitude: location.latitude ?? prev.latitude,
      longitude: location.longitude ?? prev.longitude,
    }))
  }

  const {
    cep,
    cepStatus,
    cepError,
    handleCepChange,
    requestGpsLocation,
    isLocatingGps,
    gpsError,
  } = useLocationCapture(handleLocationResolved)

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Edição manual de cidade/estado invalida as coordenadas: se o usuário
  // corrige o texto à mão, não podemos mais garantir que lat/lng batem
  // com o endereço exibido — melhor não salvar uma coordenada errada do
  // que manter uma desatualizada silenciosamente
  const handleManualLocationChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value, latitude: null, longitude: null }))
  }

  const handleSave = (e) => {
    e.preventDefault()

    // Payloads espelhando 1:1 os nomes de coluna planejados no Postgres
    // (ver script SQL). 🔴 Lembrete: o Jackson do Spring Boot normalmente
    // serializa em camelCase por padrão — se o backend não estiver
    // configurado com uma estratégia de naming snake_case, este objeto
    // precisará ser traduzido de volta na hora da chamada real via Axios.
    const dadosBasicos = {
      nome: formData.name,
      foto_url: formData.photoUrl,
      cep: cep || null,
      cidade: formData.cidade,
      estado: formData.estado,
      latitude: formData.latitude,
      longitude: formData.longitude,
    }

    const perfilAumatch = {
      tipo_moradia: formData.moradia,
      rotina_exercicios: formData.rotinaExercicio,
      tempo_fora_casa: formData.tempoForaCasa,
      tem_criancas_ou_pets: formData.temCriancasOuPets,
      especie_preferida: formData.speciesPreference,
      perfil_pet_ideal: formData.idealPetProfile,
      porte_preferido: formData.portePreferido,
    }

    console.log('Payload separado para a futura API:', { dadosBasicos, perfilAumatch })

    // Mock local ainda salva tudo junto via Context/localStorage
    updateProfile({ ...formData, cep })

    setSuccessMessage('Perfil atualizado com sucesso!')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Minha conta</h1>
          <p className="mt-1 text-slate-600">Mantenha seus dados atualizados para melhorar suas recomendações.</p>
        </div>
        {user?.id != null && (
          <Link
            to={`/perfil/publico/${user.id}`}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 sm:self-auto"
          >
            <FaEye size={14} />
            Ver perfil público
          </Link>
        )}
      </header>

      <div className="mb-8">
        <ProfileCompletionBar checklist={checklist} percentage={percentage} />
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <ProfileSection icon={FaUser} title="Dados básicos" description="Suas informações de identificação">
          <div className="mb-6 flex justify-center sm:justify-start">
            <AvatarUploadInput
              value={formData.photoUrl}
              onChange={(dataUrl) => handleFieldChange('photoUrl', dataUrl)}
              fallbackInitial={formData.name?.charAt(0)?.toUpperCase()}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Nome completo"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Como podemos te chamar?"
            />
            <FormField label="E-mail" value={formData.email} disabled hint="Usado para login — não pode ser alterado por aqui." />
          </div>
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
          <div className="mt-3">
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
          </div>
        </ProfileSection>

        <ProfileSection icon={FaHeartCircleCheck} title="Perfil AUmatch" description="Isso alimenta o algoritmo que encontra seus matches">
          <LifestyleForm values={formData} onChange={handleFieldChange} />
        </ProfileSection>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 self-start rounded-full bg-emerald-800 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900"
        >
          <FaFloppyDisk size={14} />
          Salvar alterações
        </button>
      </form>

      <div className="mt-8">
        <ProfileTabs
          tabs={[
            { key: 'animais', label: 'Animais cadastrados', icon: FaPaw, content: <UserAnimalsTab /> },
            { key: 'avaliacoes', label: 'Avaliações recebidas', icon: FaStar, content: <ReviewsTab /> },
            { key: 'impacto', label: 'Meu impacto', icon: FaHandHoldingHeart, content: <ImpactTab /> },
          ]}
        />
      </div>

      <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
    </div>
  )
}

export default UserProfilePage