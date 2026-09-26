import { useMemo, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { updateMyProfile } from '../services/userService'
import { toApiPayload } from '../utils/accountForm'

// Estado do formulário de "Minha conta", igual para os dois tipos de conta.
// Compara os patches normalizados (toUpdates) em vez do form cru: um espaço
// sobrando ou uma linha em branco na equipe não conta como "não salvo"
export function useAccountForm({ buildForm, toUpdates }) {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState(() => buildForm(user))

  const updates = useMemo(() => toUpdates(formData), [formData, toUpdates])
  const savedUpdates = useMemo(() => toUpdates(buildForm(user)), [user, buildForm, toUpdates])
  const isDirty = JSON.stringify(updates) !== JSON.stringify(savedUpdates)

  // O checklist enxerga o perfil como ele vai ficar depois de salvar
  const previewUser = useMemo(() => ({ ...user, ...updates }), [user, updates])
  const { checklist, percentage } = useProfileCompletion(previewUser)

  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  // Aceita um patch ou uma função (prev) => patch — a segunda forma é a
  // segura para callbacks assíncronos, como a busca de CEP
  const setFields = (patch) =>
    setFormData((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  // Grava no banco e só depois atualiza a sessão. Se a API recusar, o erro
  // sobe para a AccountFormShell e o form continua com as alterações
  async function save(extraUpdates = {}) {
    const next = { ...updates, ...extraUpdates }
    // O PUT substitui o perfil inteiro: o corpo sai do usuário completo, senão
    // um dado que não está no form (ex: o CEP da pessoa) seria apagado
    const savedProfile = await updateMyProfile(toApiPayload({ ...user, ...next }, user.userType))
    // O que o banco guarda volta normalizado na resposta; o resto (Perfil
    // AUmatch, coordenadas) segue como o form mandou
    const saved = { ...next, ...savedProfile }
    updateProfile(saved)
    // Recarrega o form já normalizado (sem linhas em branco, espaços etc.)
    setFormData(buildForm({ ...user, ...saved }))
    return saved
  }

  const discard = () => setFormData(buildForm(user))

  return { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard }
}
