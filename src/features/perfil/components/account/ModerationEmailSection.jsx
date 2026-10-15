import { FaEnvelope } from 'react-icons/fa6'
import FormField from '../../../../core/components/ui/FormField'
import ProfileSection from '../ProfileSection'

// Moderação: no lugar do "Acesso" (que é da própria conta), o admin edita o
// e-mail de login de outra pessoa. A conta do Google não troca de e-mail: o
// próximo login pelo Google criaria outra conta
function ModerationEmailSection({ value, onChange, isGoogleAccount, isOng }) {
  return (
    <ProfileSection icon={FaEnvelope} title="E-mail de login" description="Moderação: o e-mail com que a conta entra">
      <FormField
        label="E-mail"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isGoogleAccount}
        required
        hint={
          isGoogleAccount
            ? 'Esta conta entra pelo Google: o e-mail vem do Google e não pode ser alterado.'
            : `Trocar o e-mail encerra a sessão da conta: ela entra de novo com o e-mail novo.${isOng ? ' Ele também é o contato público da ONG.' : ''}`
        }
      />
    </ProfileSection>
  )
}

export default ModerationEmailSection
