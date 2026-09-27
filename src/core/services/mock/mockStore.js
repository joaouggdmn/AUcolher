import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../utils/storageKeys'

// Peças do "servidor falso" dos módulos que ainda não têm endpoint no Spring
// Boot. Cada módulo guarda suas tabelas numa chave do localStorage como
// { version, data }; subir a versão descarta os dados e re-semeia.
// Sem cache em memória: toda chamada relê o localStorage, então outra aba
// (ou um F5) sempre enxerga o mesmo estado
export function createMockStore({ key, version, seed }) {
  function write(data) {
    try {
      localStorage.setItem(key, JSON.stringify({ version, data }))
    } catch {
      // Estouro da cota (~5 MB), quase sempre por imagem em base64
      throw mockHttpError(400, 'Não há mais espaço no navegador para salvar. Tente uma imagem menor.')
    }
  }

  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(key))
      if (stored?.version === version && stored.data) return stored.data
    } catch {
      // payload corrompido — re-semeia
    }
    const data = seed()
    write(data)
    return data
  }

  return { read, write }
}

export function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1
}

// Simula a latência da rede, para os estados de carregamento aparecerem
export function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mesmo formato do erro do axios: getErrorMessage (core/utils/apiError.js)
// lê a `mensagem` igual nos dois modos
export function mockHttpError(status, mensagem) {
  const error = new Error(mensagem)
  error.response = { status, data: { mensagem } }
  return error
}

// O usuário salvo no login faz o papel do JWT: é quem o "servidor" enxerga
export function getMockSession() {
  try {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return null
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY))
  } catch {
    return null
  }
}

// Snapshots de pessoa/ONG só guardam foto por URL — um data URL por linha
// estouraria o localStorage rapidinho
export function httpUrlOrNull(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null
}

// Ids chegam como número (banco) ou texto (params de rota)
export function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}
