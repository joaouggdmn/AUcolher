import { FaUser, FaLocationDot, FaHeartCircleCheck } from 'react-icons/fa6'
import AvatarUploadInput from '../../../../core/components/ui/AvatarUploadInput'
import CityStateFields from '../../../../core/components/ui/CityStateFields'
import FormField from '../../../../core/components/ui/FormField'
import { useAccountForm } from '../../hooks/useAccountForm'
import { buildPersonForm, toPersonUpdates } from '../../utils/accountForm'
import ProfileCompletionBar from '../ProfileCompletionBar'
import ProfileSection from '../ProfileSection'
import LifestyleForm from '../LifestyleForm'
import AccessSection from './AccessSection'
import ModerationEmailSection from './ModerationEmailSection'
import AccountFormShell from './AccountFormShell'
import AccountGroupHeading from './AccountGroupHeading'
import TextAreaField from './TextAreaField'

// Pessoa física (seção 6.1): o perfil público é enxuto — foto, nome, bio e
// cidade. O resto (e-mail, senha, Perfil AUmatch) é privado
// `account` + `onSave`: o admin editando a conta pela moderação (ver
// useAccountForm). As respostas do quiz ficam de fora: são da pessoa
function PersonAccountForm({ account = null, onSave = null }) {
  const isModeration = account != null
  const { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard } = useAccountForm({
    buildForm: buildPersonForm,
    toUpdates: toPersonUpdates,
    account,
    onSave,
  })

  return (
    <>
      {!isModeration && <ProfileCompletionBar checklist={checklist} percentage={percentage} />}

      <div className="mt-10">
        <AccountFormShell isDirty={isDirty} onSave={() => save()} onDiscard={discard}>
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

          {isModeration ? (
            <ModerationEmailSection
              value={formData.email}
              onChange={(value) => setField('email', value)}
              isGoogleAccount={user.provider === 'GOOGLE'}
            />
          ) : (
            <AccessSection emailHint="Usado para login — não pode ser alterado por aqui." />
          )}

          <ProfileSection icon={FaLocationDot} title="Localização" description="Sua cidade e estado aparecem no perfil público">
            <CityStateFields state={formData.state} city={formData.city} onChange={setFields} />
          </ProfileSection>

          {!isModeration && (
            <ProfileSection
              icon={FaHeartCircleCheck}
              title="Perfil AUmatch"
              description="Isso alimenta o algoritmo que encontra seus matches"
            >
              <LifestyleForm values={formData} onChange={setField} />
            </ProfileSection>
          )}
        </AccountFormShell>
      </div>
    </>
  )
}

export default PersonAccountForm
