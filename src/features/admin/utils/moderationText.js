// Textos das confirmações de moderação, iguais em Usuários e em Denúncias:
// quem decide precisa ver o efeito antes de confirmar (regras §8)

export function banDescription(name, userType) {
  const content = userType === 'ONG' ? 'os anúncios, as campanhas e os eventos' : 'os anúncios'
  return `${name} não vai mais conseguir entrar. O perfil fica indisponível, ${content} somem do site e os pedidos de adoção em andamento são cancelados. As denúncias pendentes contra a conta e os anúncios dela são resolvidas.`
}

export function reactivateDescription(name) {
  return `${name} volta a entrar e o conteúdo da conta reaparece no site. Os pedidos de adoção que foram cancelados continuam cancelados.`
}
