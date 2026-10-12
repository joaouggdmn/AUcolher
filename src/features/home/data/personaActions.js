// Próximo passo de cada público, num lugar só: o hero, a seção de atalhos e
// o fechamento da "Adoção segura" usam as mesmas ações, então nunca divergem.
// - pending: no /aumatch o quiz abre sozinho para quem está logado sem ele
// - hash (#atalhos): rolagem dentro da própria home via useScrollToHash
// - visitor: o LoginPage volta para state.from depois de entrar
const ACTIONS = {
  visitor: {
    primary: { label: 'Começar meu AUmatch', to: '/cadastro', state: { preselectUserType: 'PESSOA' } },
    secondary: { label: 'Já tenho conta', to: '/login', state: { from: { pathname: '/aumatch' } } },
  },
  pending: {
    primary: { label: 'Terminar meu quiz', to: '/aumatch' },
    secondary: { label: 'Ver o que falta', to: '#atalhos' },
  },
  matched: {
    primary: { label: 'Continuar no AUmatch', to: '/aumatch' },
    secondary: { label: 'Ver meus favoritos', to: '/favoritos' },
  },
  ong: {
    primary: { label: 'Cadastrar animal', to: '/animais/criar' },
    secondary: { label: 'Interesses recebidos', to: '/interesses-recebidos' },
  },
}

// null enquanto a sessão carrega: quem chama mostra um skeleton, evitando o
// "flash" de "Começar meu AUmatch" para quem já está logado
export function getPersonaActions(persona) {
  const actions = ACTIONS[persona.kind]
  if (!actions) return null

  if (persona.kind === 'ong' && persona.pendingCount > 0) {
    return { ...actions, secondary: { ...actions.secondary, badge: persona.pendingCount } }
  }
  return actions
}
