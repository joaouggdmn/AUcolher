// Próximo passo de cada público, num lugar só: o hero, o simulador e o CTA
// final usam as mesmas ações, então nunca divergem entre si.
// - pending: no /aumatch o quiz abre sozinho para quem está logado sem ele
// - hash (#simulador): rolagem dentro da própria home via useScrollToHash
const ACTIONS = {
  visitor: {
    primary: { label: 'Começar meu AUmatch', to: '/cadastro', state: { preselectUserType: 'PESSOA' } },
    secondary: { label: 'Testar com a minha rotina', to: '#simulador' },
  },
  pending: {
    primary: { label: 'Terminar meu quiz', to: '/aumatch' },
    secondary: { label: 'Ver prévia dos meus matches', to: '#simulador' },
  },
  matched: {
    primary: { label: 'Continuar no AUmatch', to: '/aumatch' },
    secondary: { label: 'Ver o porquê de cada match', to: '#simulador' },
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
