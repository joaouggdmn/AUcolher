import { createContext, useContext, useEffect, useState } from 'react'
import { exchangeGoogleCode, loginRequest, registerRequest } from '../services/authService'
import {
  getMatchProfile,
  saveMatchProfile as saveMatchProfileRequest,
} from '../../features/aumatch/services/aumatchService'
import {
  ACCOUNT_SUSPENDED_FLAG_KEY,
  SESSION_EXPIRED_FLAG_KEY,
  TOKEN_STORAGE_KEY,
  TOKEN_TYPE_STORAGE_KEY,
  USER_STORAGE_KEY,
  LEGACY_LIFESTYLE_PROFILE_STORAGE_KEY,
  LEGACY_MOCK_EVENTOS_STORAGE_KEY,
  LEGACY_MOCK_CAMPANHAS_STORAGE_KEY,
  LEGACY_MOCK_ADMIN_STORAGE_KEY,
  LEGACY_ADMIN_DEMO_SEED_STORAGE_KEY,
  LEGACY_MOCK_MODERACAO_STORAGE_KEY,
  LEGACY_ADOPTION_REQUESTS_STORAGE_KEY,
  LEGACY_MOCK_DENUNCIAS_STORAGE_KEY,
  LEGACY_MOCK_REABANDONO_STORAGE_KEY,
} from '../utils/storageKeys'

const AuthContext = createContext(null)

// O Perfil AUmatch (respostas do quiz) mora na API e é só de pessoa física.
// null = não deu para carregar agora (a sessão segue com o que já tinha)
async function fetchMatchProfile(sessionUser) {
  if (sessionUser?.userType !== 'PESSOA') return null
  try {
    return await getMatchProfile()
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Id da conta cujo Perfil AUmatch já veio da API nesta visita: até lá, o
  // AUmatch não sabe se a pessoa já fez o quiz (pode ter feito em outro aparelho)
  const [matchProfileLoadedFor, setMatchProfileLoadedFor] = useState(null)

  // Mescla o Perfil AUmatch na sessão — só se ela ainda for da mesma conta
  function mergeMatchProfile(userId, profile) {
    setUser((prev) => {
      if (!prev || String(prev.id) !== String(userId)) return prev
      const updatedUser = { ...prev, ...profile }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
    setMatchProfileLoadedFor(userId)
  }

  useEffect(() => {
    // Versões anteriores guardavam as respostas do quiz nesta chave, solta da
    // conta (outra pessoa no mesmo navegador herdava as respostas). Agora elas
    // vêm do banco: quem não tiver perfil lá responde o quiz de novo
    localStorage.removeItem(LEGACY_LIFESTYLE_PROFILE_STORAGE_KEY)
    // O mesmo para os antigos "bancos" falsos de eventos, de campanhas e
    // doações, do painel do admin (e os dados de teste dele), da moderação
    // (com os pedidos de demonstração), das denúncias e do retorno/repasse:
    // agora vêm da API
    localStorage.removeItem(LEGACY_MOCK_EVENTOS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_MOCK_CAMPANHAS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_MOCK_ADMIN_STORAGE_KEY)
    localStorage.removeItem(LEGACY_ADMIN_DEMO_SEED_STORAGE_KEY)
    localStorage.removeItem(LEGACY_MOCK_MODERACAO_STORAGE_KEY)
    localStorage.removeItem(LEGACY_ADOPTION_REQUESTS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_MOCK_DENUNCIAS_STORAGE_KEY)
    localStorage.removeItem(LEGACY_MOCK_REABANDONO_STORAGE_KEY)

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Sessão salva antes da API em inglês (usuário com `cidade`/`estado`):
        // descarta e pede um novo login, que traz o perfil no formato atual
        if ('cidade' in parsedUser) throw new Error('sessão em formato antigo')
        // Resposta de antes da pergunta "Quem mora com você?" (era sim/não)
        delete parsedUser.temCriancasOuPets
        setUser(parsedUser)
        setIsAuthenticated(true)
        // A sessão salva já traz as últimas respostas; a API confirma (ou
        // atualiza, se o quiz foi respondido em outro aparelho)
        fetchMatchProfile(parsedUser).then((profile) => {
          if (profile) mergeMatchProfile(parsedUser.id, profile)
        })
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Havia sessão e a API recusou o token (a senha foi trocada em outro
    // aparelho, por exemplo): o login explica. Um login errado, sem sessão
    // salva, também responde 401 e não é sessão que terminou
    const handleUnauthorized = () => {
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) sessionStorage.setItem(SESSION_EXPIRED_FLAG_KEY, '1')
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    // A API recusou o token porque a conta foi banida pela moderação: a sessão
    // cai e o login explica o motivo. Sem sessão salva é o próprio login
    // recusado, e a tela de login já mostra a frase
    const handleSuspended = () => {
      if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return
      sessionStorage.setItem(ACCOUNT_SUSPENDED_FLAG_KEY, '1')
      logout()
      window.location.assign('/login')
    }
    window.addEventListener('auth:suspended', handleSuspended)
    return () => window.removeEventListener('auth:suspended', handleSuspended)
  }, [])

  // Abre a sessão com o payload do login (por senha ou pelo Google) ou do cadastro
  async function startSession({ token, tokenType, user: loggedUser }) {
    // O token vai antes: a busca do Perfil AUmatch já precisa dele
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType)

    // O perfil público (bio, redes, endereço, cidade/UF, equipe...) vem do
    // login; as respostas do quiz, da rota do AUmatch
    const matchProfile = await fetchMatchProfile(loggedUser)
    const mergedUser = { ...loggedUser, ...matchProfile }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mergedUser))
    sessionStorage.removeItem(ACCOUNT_SUSPENDED_FLAG_KEY)
    sessionStorage.removeItem(SESSION_EXPIRED_FLAG_KEY)

    setUser(mergedUser)
    setIsAuthenticated(true)
    setMatchProfileLoadedFor(matchProfile ? mergedUser.id : null)

    return mergedUser
  }

  // Só e-mail e senha — o papel (userType) vem do payload da API
  async function login({ email, password }) {
    return startSession(await loginRequest({ email, password }))
  }

  // O código que a API mandou na volta do Google vira a mesma sessão
  async function loginWithGoogle(code) {
    return startSession(await exchangeGoogleCode(code))
  }

  // Cadastrou, entrou: a API devolve o mesmo payload do login
  async function register(formData) {
    return startSession(await registerRequest(formData))
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setIsAuthenticated(false)
    setMatchProfileLoadedFor(null)
  }

  // Só atualiza a sessão local — quem precisa gravar no banco chama a API
  // antes (ver useAccountForm, que usa o PUT /users/me e o PUT /match/profile)
  function updateProfile(updates) {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  // Grava as respostas do quiz no banco e atualiza a sessão com o que voltou.
  // Se a API recusar, o erro sobe para quem chamou (o quiz mostra a mensagem)
  async function saveMatchProfile(answers) {
    const saved = await saveMatchProfileRequest(answers)
    updateProfile(saved)
    setMatchProfileLoadedFor(user?.id ?? null)
    return saved
  }

  // Pronto = já se sabe se a pessoa fez o quiz. ONG e admin não têm perfil
  const isMatchProfileReady =
    !!user && (user.userType !== 'PESSOA' || String(matchProfileLoadedFor) === String(user.id))

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isMatchProfileReady,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        saveMatchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
