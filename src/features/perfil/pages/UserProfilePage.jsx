import { useState } from 'react'
import { FaUser, FaLocationDot, FaHeartCircleCheck, FaFloppyDisk, FaPaw, FaStar, FaHandHoldingHeart } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { BRAZILIAN_STATES } from '../../../core/utils/brazilianStates'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import AvatarUploadInput from '../../../core/components/ui/AvatarUploadInput'
import ProfileCompletionBar from '../components/ProfileCompletionBar'
import ProfileSection from '../components/ProfileSection'
import FormField from '../../../core/components/ui/FormField'
import LifestyleForm from '../components/LifestyleForm'
import ProfileTabs from '../components/ProfileTabs'
import UserAnimalsTab from '../components/tabs/UserAnimalsTab'
import ReviewsTab from '../components/tabs/ReviewsTab'
import ImpactTab from '../components/tabs/ImpactTab'

function UserProfilePage() {
  const { user, updateProfile } = useAuth()

  // Campo renomeado de `nome` para `name`: alinha com o formato de `user`
  // no AuthContext, permitindo que o mesmo useProfileCompletion funcione
  // tanto aqui (rascunho) quanto na Navbar (dado persistido) sem tradução.
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    photoUrl: user?.photoUrl ?? null,
    telefone: user?.telefone ?? '',
    cidade: user?.cidade ?? '',
    estado: user?.estado ?? '',
    moradia: user?.moradia ?? '',
    rotinaExercicio: user?.rotinaExercicio ?? '',
    tempoSozinho: user?.tempoSozinho ?? '',
    temCriancasOuPets: user?.temCriancasOuPets ?? null,
  })
  const [successMessage, setSuccessMessage] = useState(null)

  // Alimenta a barra com o RASCUNHO — dá feedback visual imediato enquanto
  // o usuário preenche, antes mesmo de salvar
  const { checklist, percentage } = useProfileCompletion(formData)

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile(formData) // persiste no AuthContext → Navbar atualiza em tempo real
    setSuccessMessage('Perfil atualizado com sucesso!')
    setTimeout(() => setSuccessMessage(null), 2500)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Minha conta</h1>
        <p className="mt-1 text-slate-600">Mantenha seus dados atualizados para melhorar suas recomendações.</p>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nome completo"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Como podemos te chamar?"
            />
            <FormField label="E-mail" value={formData.email} disabled hint="Usado para login — não pode ser alterado por aqui." />
            <FormField
              label="Telefone / WhatsApp"
              value={formData.telefone}
              onChange={(e) => handleFieldChange('telefone', e.target.value)}
              placeholder="(48) 99999-9999"
              className="sm:col-span-2"
            />
          </div>
        </ProfileSection>

        <ProfileSection icon={FaLocationDot} title="Localização" description="Essencial para encontrar pets perto de você">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => handleFieldChange('cidade', e.target.value)}
              placeholder="Ex: Criciúma"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => handleFieldChange('estado', e.target.value)}
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

      <SuccessToast message={successMessage} />
    </div>
  )
}

export default UserProfilePage