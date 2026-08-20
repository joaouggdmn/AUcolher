export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  // Requisição foi enviada, mas nenhuma resposta chegou (rede caiu, CORS bloqueado, etc.)
  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
  }

  const { status, data } = error.response

  // Prioriza a mensagem que o próprio backend enviar, se houver
  if (data?.message) return data.message
  if (typeof data === 'string' && data.trim() !== '') return data

  switch (status) {
    case 400:
      return 'Não foi possível concluir. Verifique se o e-mail já está em uso ou se os dados estão corretos.'
    case 401:
      return 'E-mail ou senha inválidos.'
    case 403:
      return 'Você não tem permissão para realizar essa ação.'
    case 404:
      return 'Recurso não encontrado.'
    case 409:
      return 'Esse e-mail já está cadastrado.'
    case 500:
    case 502:
    case 503:
      return 'Erro no servidor. Tente novamente em instantes.'
    default:
      return fallback
  }
}