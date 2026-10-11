// Textos das confirmações de moderação, iguais em Usuários e em Denúncias:
// quem decide precisa ver o efeito antes de confirmar (regras §8)

export function banDescription(name, userType) {
  const content = userType === 'ONG' ? 'os anúncios, as campanhas e os eventos' : 'os anúncios'
  return `${name} não vai mais conseguir entrar. O perfil fica indisponível, ${content} somem do site e os pedidos de adoção em andamento são cancelados. As denúncias pendentes contra a conta e os anúncios dela são resolvidas.`
}

// Remover não tem "desfazer": o texto avisa
export function removeListingDescription(name) {
  return `O anúncio de ${name} sai do site e não recebe mais pedidos. Quem anunciou vê "Removido pela moderação" e não consegue editar nem reativar. Os pedidos de adoção em andamento são cancelados e as denúncias pendentes sobre o anúncio são resolvidas. Não dá para desfazer.`
}

export function removeCampaignDescription(title) {
  return `"${title}" sai do site e para de receber doações (os PIX ainda não pagos são cancelados). O que já foi doado continua no total arrecadado e no histórico de quem doou. Não dá para desfazer.`
}

export function removeEventDescription(title, confirmedCount) {
  const attendees =
    confirmedCount === 0
      ? 'Ninguém tinha confirmado presença.'
      : `${confirmedCount === 1 ? 'A pessoa que confirmou presença vê' : `As ${confirmedCount} pessoas que confirmaram presença veem`} o evento como cancelado em Minha conta.`
  return `"${title}" sai do site. ${attendees} Não dá para desfazer.`
}

export function reactivateDescription(name) {
  return `${name} volta a entrar e o conteúdo da conta reaparece no site. Os pedidos de adoção que foram cancelados continuam cancelados.`
}
