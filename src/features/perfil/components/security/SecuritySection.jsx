import AccountGroupHeading from '../account/AccountGroupHeading'
import PasswordForm from './PasswordForm'

// "Minha conta → Segurança" de pessoa e ONG (api-senha.md §8). A zona de
// "Excluir conta" (api-exclusao-conta.md §7) entra no fim desta seção
function SecuritySection() {
  return (
    <div className="mt-10 flex flex-col gap-6">
      <AccountGroupHeading
        visibility="private"
        title="Segurança"
        description="Só você vê. Cuide da senha que protege o acesso à sua conta."
      />

      <PasswordForm />
    </div>
  )
}

export default SecuritySection
