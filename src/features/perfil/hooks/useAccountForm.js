import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { updateMyProfile } from '../services/userService'
import { toApiPayload } from '../utils/accountForm'
import { saveMatchProfile } from '../../aumatch/services/aumatchService'
import { matchDeckKeys } from '../../aumatch/hooks/useAumatchDeck'
import { quizQuestions } from '../../onboarding/data/quizQuestions'

// O form de pessoa também edita o Perfil AUmatch (as respostas do quiz)
function hasMatchProfileChanges(user, next) {
  return quizQuestions.some(
    (question) => JSON.stringify(user[question.key] ?? null) !== JSON.stringify(next[question.key] ?? null)
  )
}

// Estado do formulário de "Minha conta", igual para os dois tipos de conta.
// Compara os patches normalizados (toUpdates) em vez do form cru: um espaço
// sobrando ou uma linha em branco na equipe não conta como "não salvo".
//
// Moderação: com `account` (a conta de outra pessoa, que o admin edita) e
// `onSave` (o PUT do admin), o form edita essa conta — com o e-mail de login,
// sem o Perfil AUmatch e sem mexer na sessão de quem está logado
export function useAccountForm({ buildForm: buildProfileForm, toUpdates: toProfileUpdates, account = null, onSave = null }) {
  const { user: sessionUser, updateProfile } = useAuth()
  const isModeration = account != null
  const user = isModeration ? account : sessionUser
  const buildForm = useCallback(
    (source) => (isModeration ? { ...buildProfileForm(source), email: source.email ?? '' } : buildProfileForm(source)),
    [isModeration, buildProfileForm]
  )
  const toUpdates = useCallback(
    (form) => (isModeration ? { ...toProfileUpdates(form), email: form.email.trim() } : toProfileUpdates(form)),
    [isModeration, toProfileUpdates]
  )
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(() => buildForm(user))

  const updates = useMemo(() => toUpdates(formData), [formData, toUpdates])
  const savedUpdates = useMemo(() => toUpdates(buildForm(user)), [user, buildForm, toUpdates])
  const isDirty = JSON.stringify(updates) !== JSON.stringify(savedUpdates)

  // O checklist enxerga o perfil como ele vai ficar depois de salvar
  const previewUser = useMemo(() => ({ ...user, ...updates }), [user, updates])
  const { checklist, percentage } = useProfileCompletion(previewUser)

  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  // Aceita um patch ou uma função (prev) => patch — a segunda forma é a
  // segura para callbacks assíncronos
  const setFields = (patch) =>
    setFormData((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  // Grava no banco e só depois atualiza a sessão. Se a API recusar, o erro
  // sobe para a AccountFormShell e o form continua com as alterações
  async function save(extraUpdates = {}) {
    const next = { ...updates, ...extraUpdates }
    if (isModeration) {
      const savedAccount = await onSave({ ...user, ...next })
      setFormData(buildForm(savedAccount))
      return savedAccount
    }
    // O PUT substitui o perfil inteiro: o corpo sai do usuário completo, senão
    // um dado que não está no form seria apagado
    const savedProfile = await updateMyProfile(toApiPayload({ ...user, ...next }, user.userType))
    // As respostas do quiz têm rota própria e só vão quando alguma mudou
    let savedMatchProfile = {}
    if (user.userType === 'PESSOA' && hasMatchProfileChanges(user, next)) {
      savedMatchProfile = await saveMatchProfile({ ...user, ...next })
      // Respostas novas = score novo: o deck do AUmatch recalcula
      queryClient.invalidateQueries({ queryKey: matchDeckKeys.all })
    }
    // O que o banco guarda volta normalizado nas respostas
    const saved = { ...next, ...savedProfile, ...savedMatchProfile }
    updateProfile(saved)
    // Recarrega o form já normalizado (sem linhas em branco, espaços etc.)
    setFormData(buildForm({ ...user, ...saved }))
    return saved
  }

  const discard = () => setFormData(buildForm(user))

  return { user, formData, setField, setFields, isDirty, checklist, percentage, save, discard }
}
